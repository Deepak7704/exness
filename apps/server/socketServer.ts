import { Server, Socket } from "socket.io";
import { createServer } from "http";
import express from "express";
import { subscriber } from "@repo/redis";
import cors from "cors";






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

// Define proper types
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

interface TradeData {
    data: {
        s: string;  // symbol
        p: string;  // price
        q: string;  // quantity
        T: number;  // trade time
        t: number;  // trade id
    };
}
const validIntervals : {[key:string]:string} ={
    '1m':'candles_1m',
    '5m':'candles_5m',
    '10m':'candles_10m',
    '30m':'candles_30m',
    '1h':'candles_1h',
    '1d':'candles_1d'
}

export const currentPrices: Record<string, PriceData> = {};

io.on("connection", (socket: Socket) => { // Fixed typo: was "conneciton"
    console.log("Client connected to socket", socket.id);
    socket.emit("initial-prices", currentPrices); // Fixed typo: was "intial-prices"

    // Fix: Add proper type for data parameter
    socket.on("request-price", (data: PriceRequestData) => {
        const { asset, type } = data;
        const priceData = currentPrices[asset];

        if (priceData) {
            const price = type === "buy" ? priceData.buyPrice : priceData.sellPrice;

            socket.emit("price-response", {
                asset,
                type,
                price,
                timestamp: Date.now() // Fixed typo: was "timeStamp"
            });
        } else {
            socket.emit('price-error', {
                asset,
                error: "No live price available"
            });
        }
    });
    socket.on('subscribe-candles',({asset,interval})=>{
        if(!validIntervals[interval]){
            return;
        }
        socket.join(`${asset}-${interval}`);
    })
    socket.on('unsubscribe-candles',({asset,interval})=>{
        if(!validIntervals){
            return;
        }
        socket.leave(`${asset}-${interval}`);
    })

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

            const buyPrice = +(price * (1 + spread)).toFixed(2);
            const sellPrice = +(price * (1 - spread)).toFixed(2); // Fixed: was using - instead of +

            currentPrices[symbol] = {
                symbol,
                price,
                buyPrice,
                sellPrice,
                qty: parseFloat(trade.data.q),
                time: trade.data.T,
                tradeId: trade.data.t,
                timestamp: Date.now()
            };
            
            

            io.emit("price-update", {
                symbol,
                data: currentPrices[symbol]
            });
        }
    } catch (err) {
        console.log("Socket.IO error processing trade:", err);
    }
});

server.listen(port, () => {
    console.log(`Socket.IO running on port ${port}`);
});

export { io };