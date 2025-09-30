import { Client } from "pg";

const client = new Client({
    user: "postgres",
    password: "password",
    host: "localhost",
    port: 5432,
    database: "postgres"
});

let isConnected = false;

async function connectDB(): Promise<Client> {
    if (!isConnected) {
        try {
            await client.connect();
            isConnected = true;
            console.log("DB Client Connected");
        } catch (error) {
            console.error("Database connection failed:", error);
            throw error;
        }
    }
    return client;
}

export default connectDB;
