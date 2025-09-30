import { io as Client } from "socket.io-client";

// Connect to Socket.IO server
const socket = Client("http://localhost:4000");

// Price cache with timeout
const priceCache: Record<string, {
    buyPrice: number;
    sellPrice: number;
    timestamp: number;
}> = {};

const CACHE_TIMEOUT = 5000; // 5 seconds

socket.on("connect", () => {
    console.log("Connected to Socket.IO price server");
});

socket.on("initial-prices", (prices: Record<string, { buyPrice: number; sellPrice: number }>) => {
    console.log("Received initial prices from Socket.IO");
    Object.keys(prices).forEach(asset => {
        if (prices[asset]) {
            priceCache[asset] = {
                buyPrice: prices[asset].buyPrice,
                sellPrice: prices[asset].sellPrice,
                timestamp: Date.now()
            };
        }
    });
});

socket.on("price-update", (data: { symbol: string; data: { buyPrice: number; sellPrice: number } }) => {
    
    priceCache[data.symbol] = {
        buyPrice: data.data.buyPrice,
        sellPrice: data.data.sellPrice,
        timestamp: Date.now()
    };
});

socket.on("disconnect", () => {
    console.log("Disconnected from Socket.IO price server");
});

// Main function used by your controller
export async function getAssetLivePrice(asset: string, type: "buy" | "sell"): Promise<number | null> {
    return new Promise((resolve) => {
        // Check cache first
        const cached = priceCache[asset];
        if (cached && (Date.now() - cached.timestamp) < CACHE_TIMEOUT) {
            console.log(`Using cached price for ${asset} ${type}`);
            return resolve(type === "buy" ? cached.buyPrice : cached.sellPrice);
        }
        
        // Request fresh price
        const timeout = setTimeout(() => {
            console.log(`Timeout getting price for ${asset}`);
            resolve(null);
        }, 3000);
        
        const priceHandler = (data: any) => {
            if (data.asset === asset && data.type === type) {
                clearTimeout(timeout);
                socket.off("price-response", priceHandler);
                socket.off("price-error", errorHandler);
                
                // Update cache
                if (!priceCache[asset]) priceCache[asset] = { buyPrice: 0, sellPrice: 0, timestamp: 0 };
                if (type === "buy") priceCache[asset].buyPrice = data.price;
                else priceCache[asset].sellPrice = data.price;
                priceCache[asset].timestamp = Date.now();
                
                resolve(data.price);
            }
        };
        
        const errorHandler = (error: any) => {
            if (error.asset === asset) {
                clearTimeout(timeout);
                socket.off("price-response", priceHandler);
                socket.off("price-error", errorHandler);
                resolve(null);
            }
        };
        
        socket.on("price-response", priceHandler);
        socket.on("price-error", errorHandler);
        
        // Request price from Socket.IO server
        socket.emit("request-price", { asset, type });
    });
}

export type AssetSymbol = "BTCUSDT" | "ETHUSDT" | "SOLUSDT";