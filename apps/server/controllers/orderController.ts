import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthenticationMiddleware";
import { getAssetLivePrice } from "../services/livePrice";
import { prisma } from "@repo/user_db";
import { Prisma, OrderType } from "@prisma/client"; // Import Decimal and enum

// function to place an order
export async function openOrderController(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { asset, qty, type } = req.body;
    
    if (!userId || !asset || !qty || qty <= 0) {
        return res.status(400).json({
            error: "Missing/Invalid order fields"
        });
    }

    // Convert string to OrderType enum
    const orderType: OrderType = type === "sell" ? OrderType.SELL : OrderType.BUY;
    
    // Retrieve user based on the userid
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`Requesting price for ${asset} ${orderType}`);
    const boughtPrice = await getAssetLivePrice(asset, type);
    console.log(`Received price: ${boughtPrice}`);
    
    if (!boughtPrice) {
        return res.status(400).json({
            error: "No Live price is detected"
        });
    }

    // Convert to Decimal for calculations
    const boughtPriceDecimal = new Prisma.Decimal(boughtPrice);
    const qtyDecimal = new Prisma.Decimal(qty);
    const margin = boughtPriceDecimal.mul(qtyDecimal); // Use Decimal.js methods

    // Compare Decimal values
    if (user.balance.lessThan(margin)) {
        return res.status(400).json({
            error: "Insufficient Balance"
        });
    }

    // Update the user database details
    const [updatedUser, order] = await prisma.$transaction([
        prisma.user.update({
            where: {
                id: userId
            },
            data: {
                balance: { decrement: margin }
            }
        }),
        prisma.openOrder.create({
            data: {
                userId,
                asset,
                type: orderType, // Use enum value
                boughtPrice: boughtPriceDecimal,
                qty: qtyDecimal,
                margin: margin
            }
        })
    ]);

    res.json({
        message: `${orderType === OrderType.BUY ? "Buy" : "Sell"} order placed`,
        order: {
            ...order,
            boughtPrice: order.boughtPrice.toNumber(),
            qty: order.qty.toNumber(),
            margin: order.margin.toNumber()
        },
        updatedBalance: updatedUser.balance.toNumber()
    });
}

export async function closeOrderController(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { orderId } = req.body;

    if (!userId || !orderId) {
        return res.status(400).json({
            error: "Missing required user id and order id fields"
        });
    }

    // Fetch the open order
    const order = await prisma.openOrder.findUnique({
        where: {
            id: orderId
        }
    });
    
    if (!order) {
        return res.status(404).json({
            error: "Order not found"
        });
    }
    
    // Validate order 
    if (order.userId !== userId) {
        return res.status(403).json({
            error: "Unauthorized: Order does not belong to this user"
        });
    }
    
    // Getting the current price of the asset for closing the position
    const closeType = order.type === OrderType.BUY ? "sell" : "buy";
    console.log(`Requesting closing price for ${order.asset} ${closeType}`);
    const closePrice = await getAssetLivePrice(order.asset, closeType);
    console.log(`Received the close price is - $ ${closePrice}`);

    if (!closePrice) {
        return res.status(400).json({
            error: "No Live price is detected for closing"
        });
    }
    
    // Convert to Decimal for calculations
    const closePriceDecimal = new Prisma.Decimal(closePrice);
    
    // Calculating the P&L using Decimal.js methods
    let pnl: Prisma.Decimal;
    if (order.type === OrderType.BUY) {
        // pnl = (closePrice - boughtPrice) * qty
        pnl = closePriceDecimal.minus(order.boughtPrice).mul(order.qty);
    } else {
        // pnl = (boughtPrice - closePrice) * qty
        pnl = order.boughtPrice.minus(closePriceDecimal).mul(order.qty);
    }

    const finalBalance = order.margin.plus(pnl);
    
    // Round to 2 decimal places
    const finalBalanceRounded = finalBalance.toDecimalPlaces(2);
    const pnlRounded = pnl.toDecimalPlaces(2);

    // Update in the database
    const [updatedUser, closedOrder] = await prisma.$transaction([
        prisma.user.update({
            where: {
                id: userId
            },
            data: {
                balance: { increment: finalBalanceRounded }
            }
        }),
        prisma.closedOrder.create({
            data: {
                userId: order.userId,
                asset: order.asset,
                type: order.type, // Already an enum
                boughtPrice: order.boughtPrice,
                closedPrice: closePriceDecimal,
                qty: order.qty,
                margin: order.margin,
                pnl: pnlRounded,
                openTime: order.createdAt
            }
        }),
        prisma.openOrder.delete({
            where: {
                id: orderId
            }
        })
    ]);

    // Convert Decimal to numbers for JSON response
    const pnlNumber = pnlRounded.toNumber();
    const marginNumber = order.margin.toNumber();

    res.json({
        message: "Order Closed successfully",
        closedOrder: {
            id: closedOrder.id,
            asset: closedOrder.asset,
            type: closedOrder.type,
            boughtPrice: closedOrder.boughtPrice.toNumber(),
            closedPrice: closedOrder.closedPrice.toNumber(),
            qty: closedOrder.qty.toNumber(),
            margin: marginNumber,
            pnl: pnlNumber,
            pnlPercentage: ((pnlNumber / marginNumber) * 100).toFixed(2) + "%"
        },
        updatedBalance: updatedUser.balance.toNumber(),
        profit: pnlNumber >= 0
    });
}
// Add these two new functions to your orderController.ts

export async function getOpenOrdersController(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized: User ID not found"
        });
    }

    try {
        const openOrders = await prisma.openOrder.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc' // Most recent orders first
            }
        });

        const serializedOrders = openOrders.map(order => ({
            id: order.id,
            asset: order.asset,
            type: order.type,
            boughtPrice: order.boughtPrice.toNumber(),
            qty: order.qty.toNumber(),
            margin: order.margin.toNumber(),
            createdAt: order.createdAt.toISOString(),
        }));

        res.json({
            openOrders: serializedOrders,
            count: serializedOrders.length
        });
    } catch (error) {
        console.error('Error fetching open orders:', error);
        res.status(500).json({
            error: "Failed to fetch open orders"
        });
    }
}

export async function getClosedOrdersController(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized: User ID not found"
        });
    }

    try {
        const closedOrders = await prisma.closedOrder.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                closedAt: 'desc' // Most recent closed orders first
            }
        });

        
        const serializedOrders = closedOrders.map(order => ({
            id: order.id,
            asset: order.asset,
            type: order.type,
            boughtPrice: order.boughtPrice.toNumber(),
            closedPrice: order.closedPrice.toNumber(),
            qty: order.qty.toNumber(),
            margin: order.margin.toNumber(),
            pnl: order.pnl.toNumber(),
            openTime: order.openTime.toISOString(),
            closedAt: order.closedAt.toISOString(),
        }));

        res.json({
            closedOrders: serializedOrders,
            count: serializedOrders.length
        });
    } catch (error) {
        console.error('Error fetching closed orders:', error);
        res.status(500).json({
            error: "Failed to fetch closed orders"
        });
    }
}

