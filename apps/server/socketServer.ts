import { Server, Socket } from "socket.io";
import { createServer } from "http";
import express from "express";
import { subscriber } from "@repo/redis";
import cors from "cors";
import connectDB from "@repo/db/index" // Import your DB connection

const app = express();

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const spread = 0.02;
const port = 4000;

// Price multipliers for TimescaleDB (same as your schema)
const priceMultiplier = 1e8;
const qtyMultiplier = 1e6;

type Interval = "1m" | "5m" | "10m" | "30m" | "1h" | "1d";

interface PriceRequestData {
    asset: string;
    type: "buy" | "sell";
}

interface PriceData {
    symbol: string;
    price: number;
    buyPrice: number;
    sellPrice: number;
    qty: number;
    time: number;
    tradeId: number;
    timestamp: number;
}

interface Candle {
    symbol: string;
    interval: string;
    openTime: number;
    closeTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    trades: number;
    isClosed: boolean;
}

interface TradeData {
    data: {
        s: string;
        p: string;
        q: string;
        T: number;
        t: number;
    };
}

let lastEmitTime: Record<string, number> = {};
const EMIT_THROTTLE = 100;

const validIntervals: {[key:string]:string} = {
    '1m':'candles_1m',
    '5m':'candles_5m',
    '10m':'candles_10m',
    '30m':'candles_30m',
    '1h':'candles_1h',
    '1d':'candles_1d'
}

const intervalDurations: Record<Interval, number> = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "10m": 10 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
};

export const currentPrices: Record<string, PriceData> = {};
const currentCandles: Map<string, Candle> = new Map();

// Initialize DB client
let dbClient = await connectDB();

// Save trade to TimescaleDB
// Save trade to TimescaleDB
// async function saveTradeToDatabase(symbol: string, price: number, quantity: number, tradeTime: number, tradeId: number) {
//     if (!dbClient) {
//         console.error("DB client not initialized");
//         return;
//     }

//     try {
//         // Convert to integers using multipliers
//         const priceInt = Math.round(price * priceMultiplier);
//         const quantityInt = Math.round(quantity * qtyMultiplier);

//         await dbClient.query(
//             `INSERT INTO trades (time, symbol, price, quantity, trade_id)
//              VALUES (to_timestamp($1 / 1000.0), $2, $3, $4, $5)
//              ON CONFLICT (time, trade_id) DO NOTHING`,
//             [tradeTime, symbol.toUpperCase(), priceInt, quantityInt, tradeId]  // ← CHANGED
//         );
        
//         // ← ADDED THIS LINE
//         console.log(`Trade saved: ${symbol} @ ${price} (ID: ${tradeId})`);
//     } catch (error) {
//         console.error("Error saving trade to database:", error);
//     }
// }

function getCandleKey(symbol: string, interval: string): string {
    return `${symbol}:${interval}`;
}

function getCandleOpenTime(timestamp: number, intervalMs: number): number {
    return Math.floor(timestamp / intervalMs) * intervalMs;
}

function createCandle(symbol: string, interval: Interval, price: number, volume: number, timestamp: number): Candle {
    const intervalMs = intervalDurations[interval];
    const openTime = getCandleOpenTime(timestamp, intervalMs);
    
    return {
        symbol,
        interval,
        openTime,
        closeTime: openTime + intervalMs - 1,
        open: price,
        high: price,
        low: price,
        close: price,
        volume,
        trades: 1,
        isClosed: false
    };
}

function updateCandle(candle: Candle, price: number, volume: number): Candle {
    return {
        ...candle,
        high: Math.max(candle.high, price),
        low: Math.min(candle.low, price),
        close: price,
        volume: candle.volume + volume,
        trades: candle.trades + 1
    };
}

// Process an incoming trade and update all relevant candles (across all intervals)
// This keeps in-memory candle data up to date and emits updates in real-time
function processTradeForCandles(symbol: string, price: number, volume: number, timestamp: number) {
    // Loop through all configured candle intervals (e.g., 1m, 5m, 1h)
    (Object.keys(intervalDurations) as Interval[]).forEach(interval => {
        // Build a unique key for the candle based on symbol and interval
        const key = getCandleKey(symbol, interval);

        // Get the duration of the current interval in milliseconds
        const intervalMs = intervalDurations[interval];

        // Calculate the open time for the candle corresponding to this trade's timestamp
        const currentOpenTime = getCandleOpenTime(timestamp, intervalMs);

        // Try to get the existing candle from the in-memory store
        let candle = currentCandles.get(key);

        // If there is an existing candle but its openTime does not match the current interval,
        // it means the candle has closed and we must finalize it and start a new one
        if (candle && candle.openTime !== currentOpenTime) {
            // Mark the old candle as closed
            candle.isClosed = true;

            // Broadcast the closed candle to clients subscribed to this symbol+interval
            io.to(`${symbol}-${interval}`).emit('candle-closed', candle);

            // Create a new candle for the fresh interval with the incoming trade data
            candle = createCandle(symbol, interval, price, volume, timestamp);

        // If no candle exists for this interval yet, create the very first one
        } else if (!candle) {
            candle = createCandle(symbol, interval, price, volume, timestamp);

        // Otherwise, update the existing (still-open) candle with new trade price & volume
        } else {
            candle = updateCandle(candle, price, volume);
        }

        // Store the updated (or newly created) candle back into the in-memory map
        currentCandles.set(key, candle);

        // Emit the latest candle state to all connected subscribers in real-time
        io.to(`${symbol}-${interval}`).emit('candle-update', candle);
    });
}



io.on("connection", (socket: Socket) => {
    console.log("Client connected to socket", socket.id);
    socket.emit("initial-prices", currentPrices);

    socket.on("request-price", (data: PriceRequestData) => {
        const { asset, type } = data;
        const priceData = currentPrices[asset];

        if (priceData) {
            const price = type === "buy" ? priceData.buyPrice : priceData.sellPrice;

            socket.emit("price-response", {
                asset,
                type,
                price,
                timestamp: Date.now()
            });
        } else {
            socket.emit('price-error', {
                asset,
                error: "No live price available"
            });
        }
    });

    socket.on('subscribe-candles', ({asset, interval}: {asset: string, interval: string}) => {
        if (!validIntervals[interval]) {
            socket.emit('candle-error', { 
                error: 'Invalid interval',
                validIntervals: Object.keys(validIntervals)
            });
            return;
        }
        
        const room = `${asset}-${interval}`;
        socket.join(room);
        
        // Send current candle if it exists
        const key = getCandleKey(asset, interval);
        const currentCandle = currentCandles.get(key);
        
        if (currentCandle) {
            socket.emit('candle-initial', currentCandle);
        }
        
        console.log(`Client ${socket.id} subscribed to ${room}`);
    });

    socket.on('unsubscribe-candles', ({asset, interval}: {asset: string, interval: string}) => {
        if (!validIntervals[interval]) {
            return;
        }
        
        const room = `${asset}-${interval}`;
        socket.leave(room);
        console.log(`Client ${socket.id} unsubscribed from ${room}`);
    });

    socket.on("disconnect", () => {
        console.log("Client Disconnected", socket.id);
    });
});

subscriber.subscribe("trade-channel", (message: string) => {
    try {
        const trade: TradeData = JSON.parse(message);
        if (trade.data && ["BTCUSDT", "ETHUSDT", "SOLUSDT"].includes(trade.data.s)) {
            const symbol = trade.data.s;
            const price = parseFloat(trade.data.p);
            const volume = parseFloat(trade.data.q);
            const timestamp = trade.data.T;
            const tradeId = trade.data.t;

            const buyPrice = +(price * (1 + spread)).toFixed(2);
            const sellPrice = +(price * (1 - spread)).toFixed(2);

            currentPrices[symbol] = {
                symbol,
                price,
                buyPrice,
                sellPrice,
                qty: volume,
                time: timestamp,
                tradeId: tradeId,
                timestamp: Date.now()
            };

            io.emit("price-update", {
                symbol,
                data: currentPrices[symbol]
            });


            // Process trade for real-time candles
            processTradeForCandles(symbol, price, volume, timestamp);
        }
    } catch (err) {
        console.log("Socket.IO error processing trade:", err);
    }
});


server.listen(port, () => {
    console.log(`Socket.IO running on port ${port}`);
});

export { io };