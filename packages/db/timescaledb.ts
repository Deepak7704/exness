import client from "./index";
// mutlipliers for converting decimal values into integer values
const priceMultiplier = 1e8;
const qtyMultiplier = 1e6;

async function connection(){
    try{
        console.log("Starting database connection...");
        await client.connect(); // connects the tdb client that is generated using pg
        console.log("Database connected successfully");

        //create the main trades table
        await client.query(`
            CREATE TABLE IF NOT EXISTS trades(
                time TIMESTAMP WITH TIME ZONE NOT NULL,
                symbol TEXT NOT NULL,
                price BIGINT NOT NULL,
                quantity BIGINT NOT NULL,
                trade_id BIGINT NOT NULL,
                PRIMARY KEY(time,trade_id)
            )
            
            `);

        //now we should convert the above hypertable into materialized views 
        // this converts the regular postgres table into timescaledb table
        await client.query(
            `
                SELECT create_hypertable('trades','time',if_not_exists => TRUE); 
            `
        )
        //optimization for queries using indexing
        await client.query(
            `   
                CREATE INDEX IF NOT EXISTS idx_trade_symbol_time ON trades(symbol,time);
                CREATE INDEX IF NOT EXISTS idx_trades_trade_id ON trades(trade_id);
            `   
        )
        //function to create candle stick aggregtations 
        async function createCandle(interval:string,viewName:string,schedule:string){
            await client.query(`
              CREATE MATERIALIZED VIEW IF NOT EXISTS ${viewName}
              WITH (timescaledb.continuous) AS
              SELECT
                    time_bucket('${interval}',time) AS bucket,
                    symbol,
                    FIRST(price::NUMERIC/${priceMultiplier},time) AS open,
                    MAX(price::NUMERIC/${priceMultiplier}) AS high,
                    MIN(price::NUMERIC/${priceMultiplier}) AS low,
                    LAST(price::NUMERIC/${priceMultiplier},time) AS close,
                    SUM(quantity::NUMERIC/${qtyMultiplier}) AS quantity
                    FROM trades GROUP BY bucket,symbol;
                
                `)
            
            await client.query(
                `
                    SELECT add_continuous_aggregate_policy('${viewName}',
                        start_offset => INTERVAL '7 days',
                        end_offset => INTERVAL '${interval}',
                        schedule_interval => INTERVAL '${schedule}'
                    );
                `
            )

            console.log("Tables created for each time interval");
        }
        await createCandle("1 minute","candles_1m","30 seconds");
        await createCandle("5 minutes","candles_5m","1 minute");
        await createCandle("10 minutes","candles_10m","2 minutes");
        await createCandle("30 minutes","candles_30m","5 minutes");
        await createCandle("1 hour","candles_1h","10 minutes");
        await createCandle("1 day","candles_1d","1 hour");

    }catch(err){
        console.log("Database setup error occured",err);
        throw err;
    }finally{
        await client.end();
    }
}

//executing the entire database setup

(async ()=>{
    try{
        await connection();
        console.log("Database Set up Completed");
    }catch(err){
        console.error("Error while setting up the database",err);
    }
})();