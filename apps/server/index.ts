import express from "express";
import router from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import candleRoutes from "./routes/candleRoutes";
import cors from "cors";
import agentRoutes from './routes/agentRoutes';
import rateLimitMiddleware from './middleware/rateLimitMiddleware';
import "./socketServer";
const app = express();


app.use(cors({
  origin: 'http://localhost:3001', // Your frontend port
  credentials: true
}));


app.use(express.json());
app.use(rateLimitMiddleware);
app.use("/api/user",router);
app.use("/api/orders",orderRoutes);
app.use("/api/candles",candleRoutes);
app.use('/api/agent', agentRoutes);
console.log(" Server is running on port 3000 ");
app.listen(3000);
