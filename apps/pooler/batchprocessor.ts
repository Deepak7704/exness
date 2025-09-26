import { consumer } from "@repo/redis";
import client from "@repo/db/index"
import type { BinanceTradeData } from "./types/index";


// the batch_size is used to batch the incoming stream of requests into a batch and store them into a database
// price multiplier and qty multiplier are the values that are used to conver the decimal values that are coming from the queue
const BATCH_SIZE = 1000;
const PRICE_MULTIPLIER = 1e8;
const QTY_MULTIPLIER = 1e6;
const TIMEOUT = 5000; // time out is used to define that only for this much amount of the time the queue waits for the value else it processes the batch after this timeout value exceeds

let flushtimeout : NodeJS.Timeout | null = null;
let tradeBuffer : BinanceTradeData[] = []; // an empty array that is declared to track the amount of responses coming if the tradebuffer length is equal to or greater than batch size they are stored into the database
let processCount = 0;

async function addTrade(){
    try{
        if(tradeBuffer.length === 0){
            return;
        }
        const values:(string|number)[] = [];
        const placeholder:string[] = [];
        tradeBuffer.forEach((trade, index) => {
            const i = index * 5;
            placeholder.push(`($${i + 1},$${i + 2},$${i + 3},$${i + 4},$${i + 5})`);

            const priceInt = Math.round(parseFloat(trade.data.p)*PRICE_MULTIPLIER);
            const qtyInt = Math.round(parseFloat(trade.data.q)*QTY_MULTIPLIER);

            values.push(
                new Date(trade.data.E).toISOString(),
                trade.data.s,
                priceInt,
                qtyInt,
                trade.data.t
            );
        });
        const query = `INSERT INTO trades(time, symbol, price, quantity, trade_id)
                      VALUES ${placeholder.join(",")}`;

        try{
            await client.query(query, values);
            processCount += tradeBuffer.length;
            console.log(`Inserted ${tradeBuffer.length} trades in batch (Total: ${processCount})`);
        }catch(err){
            console.error(err);
            for(const trade of tradeBuffer){
                await consumer.lPush("trade-retry-queue",JSON.stringify(trade));
            }
        }finally{
            tradeBuffer = [];
            if(flushtimeout){
                clearTimeout(flushtimeout);
                flushtimeout = null;
            }
        }
    }catch(err){
        console.error(err);
    }
}


function scheduleFlush(){
    if(flushtimeout){
        clearTimeout(flushtimeout)
    }
    flushtimeout = setTimeout(async () => {
        if(tradeBuffer.length > 0 ){
            await addTrade();
        }
    },TIMEOUT)
}

async function consumeTrade(){
    while(true){
        try{
            const result = await consumer.brPop("trade-queue",0);
            if(!result){
                continue;
            }
            const trade_data = result.element;
            let trade : BinanceTradeData;

            try{
                trade = JSON.parse(trade_data);
            }catch(err){
                console.warn("Invalid JSON Queue",trade_data);
                continue;
            }

            if(trade.data?.E && trade.data?.p && trade.data?.q && trade.data?.t && trade.data?.s){
                tradeBuffer.push(trade);

                scheduleFlush();
                console.log(`Buffered trade: ${trade.data.s} at $${trade.data.p} (Buffer: ${tradeBuffer.length}/${BATCH_SIZE})`);

                if(tradeBuffer.length >= BATCH_SIZE){
                    await addTrade();
                }
            }else{
                console.warn("Skipped invalid trade structure:", {
                    stream: trade.stream,
                    hasData: !!trade.data,
                    hasPrice: !!trade.data?.p,
                    hasQuantity: !!trade.data?.q,
                    hasTradeId: !!trade.data?.t
                });
            }
        }catch(err){
            console.error(err);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}
(async () => {
    try {
        await client.connect();
        console.log("Connected to Database");
        await consumeTrade();
        
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
})();