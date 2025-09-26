import express from "express";
import router from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
const app = express();

app.use(express.json());
app.use("/api/user",router);
app.use("/api/orders",orderRoutes);
console.log(" Server is running on port 3000 ");
app.listen(3000);
