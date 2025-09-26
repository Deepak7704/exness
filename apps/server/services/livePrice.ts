
type AssetSymbol = "BTCUSDT" | "ETHUSDT" | "SOLUSDT";

interface TradeInfo {
    symbol: AssetSymbol,
    price: number,
    buyPrice: number,
    sellPrice: number,
    qty: number,
    time: number,
    tradeId: number
}

// Export this so both files can access it
export const currentTrades: Record<AssetSymbol, TradeInfo | undefined> = {
    BTCUSDT: undefined,
    ETHUSDT: undefined,
    SOLUSDT: undefined
};

export function getAssetLivePrice(asset: "BTCUSDT" | "ETHUSDT" | "SOLUSDT", type: "buy" | "sell") {
    const trade = currentTrades[asset];
    if (!trade) return undefined;
    if (type === "buy") return trade.buyPrice;
    if (type === "sell") return trade.sellPrice;
}

export type { AssetSymbol, TradeInfo };