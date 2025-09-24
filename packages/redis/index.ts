import { createClient } from "redis";


//  ------ publisher and subcriber connections are required for using redis pubsubs
// Publisher client that handles the regular redis operations like rpush and so on
const publisher = createClient({
    url:"redis://:password@localhost:6379"
})
//Subscriber client that handles the regular redis operations for clients

const subscriber = createClient({
    url:"redis://:password@localhost:6379"
})

// consumer conncetion is required for using redis operations related to queues

const consumer = createClient({
    url:"redis://:password@localhost:6379"
})

//connections with error handlings 

async function intializeRedisConnections(){
    try{
        await publisher.connect();
        console.log("Publisher is connected");
        await subscriber.connect();
        console.log("Subscriber is connected");
        await consumer.connect();
        console.log("Consumer is connected");
    }catch(err){
        console.error("Reddis connection occured",err);
        process.exit(1);
    }
}
await intializeRedisConnections();
export {publisher,subscriber,consumer};