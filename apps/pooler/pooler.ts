import WebSocket from "ws";
import { publisher } from "@repo/redis"
import type { BinanceTradeData } from "./types/index";

const url = "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade";
const ws = new WebSocket(url);

ws.on("open", () => {
    console.log("Connected to Binance Websocket")
});

ws.on("message", async (trade) => {
    try {
        const data: BinanceTradeData = JSON.parse(trade.toString());
        
        // Check if we have valid trade data
        if (data.stream && data.data) {
            // Use pipeline for better performance
            const pipeline = publisher.multi();
            pipeline.publish("trade-channel", JSON.stringify(data));
            pipeline.rPush("trade-queue", JSON.stringify(data));
            await pipeline.exec();
            
            // Access price correctly: data.data.p (not data.p)
            // console.log("Data queued", {
            //     stream: data.stream,
            //     symbol: data.data.s,
            //     price: data.data.p,     
            //     quantity: data.data.q,  
            //     tradeTime: data.data.T,
            //     tradeId : data.data.t
            // });
        } else {
            console.log("Invalid trade data structure:", data);
        }
    } catch (err) {
        console.log("Error on pushing the web socket data into queue:", err);
    }
});

ws.on("close", () => {
    console.log("WebSocket connection closed");
});
