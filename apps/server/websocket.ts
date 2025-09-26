import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { subscriber } from "@repo/redis";
import { currentTrades, type AssetSymbol } from "./services/livePrice";

const spread = 0.02; // means 2% spread
const port = process.env.WS_PORT ? Number(process.env.WS_PORT) : 4000;

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
    console.log("New WebSocket connection");
    socket.send(
        JSON.stringify({
            type: "initial", // Fixed typo: was "intial"
            trades: Object.fromEntries(
                Object.entries(currentTrades).filter(([_, t]) => t != undefined)
            ),
        })
    )
});

// Handling trades from redis pubsub
subscriber.subscribe("trade-channel", (message) => {
    try {
        const trade = JSON.parse(message);
        if (trade.data && ["BTCUSDT", "ETHUSDT", "SOLUSDT"].includes(trade.data.s)) {
            const symbol = trade.data.s as AssetSymbol;
            const price = parseFloat(trade.data.p);

            const buyPrice = +(price * (1 + spread)).toFixed(2);
            const sellPrice = +(price * (1 - spread)).toFixed(2);

            // Update the shared currentTrades object
            currentTrades[symbol] = {
                symbol,
                price,
                buyPrice,
                sellPrice,
                qty: parseFloat(trade.data.q),
                time: trade.data.T,
                tradeId: trade.data.t
            };

            const update = {
                type: "update",
                symbol,
                trade: { ...currentTrades[symbol] },
            };

            wss.clients.forEach((ws) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(update));
                }
            });
        }
    } catch (err) {
        console.log("Trade update not done through pubsub", err);
    }
});

server.listen(port, () => {
    console.log(`WebSocket server running on port ${port}`);
});