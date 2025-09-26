import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthenticationMiddleware";
import { getAssetLivePrice } from "../services/livePrice";
import { prisma } from "@repo/user_db";

// function to provide the live price of an asset
export async function openOrderController(req:AuthRequest,res:Response){
    const userId = req.user?.id
    const {asset,qty,type} = req.body;
    if(!userId || !asset || !qty || qty <= 0)
        return res.status(400).json({
            error:"Misssing/Invalid order fields"
        })
    const orderType = type === "sell" ? "sell" : "buy";
    const livePrice = await getAssetLivePrice(asset,orderType);
    //retrieve user based on the userid
    const user = await prisma.user.findUnique({
        where:{
            id:userId
        }
    })
    if(!user) return res.status(404).json({ error:"User not found" })
    
    console.log(`Requesting price for ${asset} ${orderType}`);
    const boughtPrice = await getAssetLivePrice(asset, orderType);
    console.log(`Received price: ${boughtPrice}`);
    if(!boughtPrice) return res.status(400).json({
        error:"No Live price is detected"
    })

    const margin = boughtPrice*qty;
    if(user.balance < margin){
        return res.status(400).json({
            error:"Insufficient Balance"
        })
    }

    // Update the user database details
    const[updatedUser,order] = await prisma.$transaction([
        prisma.user.update({
            where:{
                id:userId
            },
            data:{
                balance:{decrement:margin}
            },
        }),
        prisma.openOrder.create({
            data:{
                userId,
                asset,
                type:orderType,
                boughtPrice,
                qty,
                margin
            }
        })
    ]);
    res.json({
        message:`${orderType==="buy"?"Buy":"Sell"} order placed`,
        order,
        updatedBalance:updatedUser.balance,
    });
}