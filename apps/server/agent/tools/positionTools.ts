import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { prisma } from '@repo/user_db';
import { publisher as redis } from '@repo/redis';

const getUserPositionsSchema = z.object({
  userId: z.string().describe('User ID from authentication (UUID string)'),
  symbol: z.enum(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']).describe('Trading symbol to check'),
});

const calculatePortfolioRiskSchema = z.object({
  userId: z.string().describe('User ID from authentication (UUID string)'),
  symbol: z.enum(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']).describe('Symbol to analyze risk for'),
});

type GetUserPositionsInput = z.infer<typeof getUserPositionsSchema>;
type CalculatePortfolioRiskInput = z.infer<typeof calculatePortfolioRiskSchema>;

export const getUserPositionsTool = new DynamicStructuredTool({
  name: 'get_user_positions',
  description: `Retrieves user's open positions (OpenOrders) for a specific cryptocurrency symbol.
    
Use this tool FIRST when user asks about adding to positions or opening new trades.

Returns:
- Number of existing open orders
- Total quantity and average entry price
- Total margin used
- Detailed breakdown of each position

This helps assess if adding more exposure is appropriate.`,
  
  schema: getUserPositionsSchema,
  
  func: async (input: GetUserPositionsInput): Promise<string> => {
    const { userId, symbol } = input;
    
    console.log('[TOOL] get_user_positions EXECUTING');
    console.log(`[DB] Input - userId: "${userId}", symbol: "${symbol}"`);
    
    try {
      // Step 1: Verify Prisma is connected
      console.log('[DB] Checking Prisma connection...');
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('[DB] Prisma connection OK');
      } catch (connError) {
        console.error('[DB] Prisma connection FAILED:', connError);
        throw new Error('Database connection failed');
      }

      // Step 2: Check if user exists
      console.log('[DB] Checking if user exists...');
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        console.error(`[DB] User NOT FOUND: ${userId}`);
        return `Error: User with ID ${userId} not found in database`;
      }
      
      console.log(`[DB] User FOUND: ${user.email}`);
      console.log(`[DB] User balance: $${user.balance}, used margin: $${user.usedMargin}`);

      // Step 3: Query open orders
      console.log(`[DB] Querying openOrders table for userId="${userId}" and asset="${symbol}"`);
      
      const openOrders = await prisma.openOrder.findMany({
        where: {
          userId: userId,
          asset: symbol,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`[DB] Query returned ${openOrders.length} orders`);
      
      if (openOrders.length > 0) {
        console.log('[DB] Order details:');
        openOrders.forEach((order, index) => {
          console.log(`  Order ${index + 1}: type=${order.type}, qty=${order.qty}, price=${order.boughtPrice}, margin=${order.margin}`);
        });
      }

      // Step 4: Handle no positions
      if (!openOrders || openOrders.length === 0) {
        const result = `User has NO existing ${symbol} positions. Portfolio is available for new ${symbol} trades.`;
        console.log(`[DB] Returning: ${result}`);
        return result;
      }

      // Step 5: Calculate statistics
      console.log('[DB] Calculating position statistics...');
      
      const totalQuantity = openOrders.reduce((sum, o) => sum + Number(o.qty), 0);
      const totalMargin = openOrders.reduce((sum, o) => sum + Number(o.margin), 0);
      const avgEntryPrice = openOrders.reduce((sum, o) => 
        sum + (Number(o.boughtPrice) * Number(o.qty)), 0) / totalQuantity;

      console.log(`[DB] Calculations: qty=${totalQuantity}, margin=${totalMargin}, avgPrice=${avgEntryPrice}`);

      // Step 6: Format response
      const result = `Existing ${symbol} Positions:

Total Open Orders: ${openOrders.length}
Total Quantity: ${totalQuantity.toFixed(8)} units
Average Entry Price: $${avgEntryPrice.toFixed(2)}
Total Margin Used: $${totalMargin.toFixed(2)}

Position Details:
${openOrders.map((o, i) => 
  `${i + 1}. ${o.type} ${Number(o.qty).toFixed(8)} @ $${Number(o.boughtPrice).toFixed(2)} | Margin: $${Number(o.margin).toFixed(2)} | Opened: ${new Date(o.createdAt).toLocaleString()}`
).join('\n')}

Status: User has ${openOrders.length} active ${symbol} position(s)`;

      console.log('[DB] Result prepared successfully');
      return result;

    } catch (error) {
      console.error('[DB] TOOL ERROR in get_user_positions:');
      
      if (error instanceof Error) {
        console.error(`[DB] Error name: ${error.name}`);
        console.error(`[DB] Error message: ${error.message}`);
        console.error(`[DB] Error code: ${(error as any).code}`);
        console.error(`[DB] Stack: ${error.stack}`);
        
        return `Error retrieving ${symbol} positions: ${error.message}`;
      } else {
        console.error(`[DB] Unknown error:`, error);
        return `Error retrieving ${symbol} positions: Unknown error`;
      }
    }
  },
});

export const calculatePortfolioRiskTool = new DynamicStructuredTool({
  name: 'calculate_portfolio_risk',
  description: `Calculates portfolio exposure and risk metrics for a specific symbol based on margin usage.
    
Use this tool to assess:
- Current margin exposure percentage for the symbol
- How much capital is available for new positions
- Risk level assessment
- Whether adding positions violates risk management rules

Critical for determining if user should add more positions.`,
  
  schema: calculatePortfolioRiskSchema,
  
  func: async (input: CalculatePortfolioRiskInput): Promise<string> => {
    const { userId, symbol } = input;
    
    console.log('[TOOL] calculate_portfolio_risk EXECUTING');
    console.log(`[DB] Input - userId: "${userId}", symbol: "${symbol}"`);
    
    try {
      // Step 1: Get user account
      console.log('[DB] Fetching user account...');
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          balance: true,
          usedMargin: true
        },
      });

      if (!user) {
        console.error(`[DB] User NOT FOUND: ${userId}`);
        return `Unable to find user account information for ID: ${userId}`;
      }
      
      console.log(`[DB] User found - balance: $${user.balance}, usedMargin: $${user.usedMargin}`);

      const totalBalance = Number(user.balance);
      const usedMargin = Number(user.usedMargin);
      const availableBalance = totalBalance - usedMargin;

      // Step 2: Get all open orders
      console.log('[DB] Fetching all open orders...');
      
      const allOpenOrders = await prisma.openOrder.findMany({
        where: { userId: userId },
      });

      console.log(`[DB] Found ${allOpenOrders.length} total open orders`);
      if (allOpenOrders.length > 0) {
        console.log('[DB] Orders by symbol:');
        const symbolCounts = allOpenOrders.reduce((acc, o) => {
          acc[o.asset] = (acc[o.asset] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        Object.entries(symbolCounts).forEach(([sym, count]) => {
          console.log(`  ${sym}: ${count} orders`);
        });
      }

      // Step 3: Calculate exposures
      console.log('[DB] Calculating portfolio exposure...');
      
      const totalMarginUsed = allOpenOrders.reduce((sum, o) => 
        sum + Number(o.margin), 0);
      
      const exposurePercentage = (totalMarginUsed / totalBalance) * 100;

      const symbolOrders = allOpenOrders.filter(o => o.asset === symbol);
      const symbolMargin = symbolOrders.reduce((sum, o) => 
        sum + Number(o.margin), 0);
      
      const symbolExposurePercentage = (symbolMargin / totalBalance) * 100;

      console.log(`[DB] Total exposure: ${exposurePercentage.toFixed(2)}%`);
      console.log(`[DB] ${symbol} exposure: ${symbolExposurePercentage.toFixed(2)}%`);

      // Step 4: Assess risk
      let riskLevel: string;
      let recommendation: string;

      if (symbolExposurePercentage >= 10) {
        riskLevel = 'HIGH RISK';
        recommendation = 'AVOID adding more positions. Already at maximum recommended exposure (20%).';
      } else {
        riskLevel = 'LOW RISK';
        recommendation = 'Sufficient room for new positions within risk parameters.';
      }

      const maxRecommendedMargin = totalBalance * 0.20;
      const availableCapital = Math.max(0, maxRecommendedMargin - symbolMargin);

      console.log(`[DB] Risk level: ${riskLevel}`);
      console.log(`[DB] Available capital: $${availableCapital.toFixed(2)}`);

      return `Portfolio Risk Analysis for ${symbol}:

Total Account Balance: $${totalBalance.toFixed(2)}
Used Margin (All Positions): $${usedMargin.toFixed(2)} (${exposurePercentage.toFixed(2)}%)
Available Balance: $${availableBalance.toFixed(2)}


${symbol} Exposure:
- Margin Used: $${symbolMargin.toFixed(2)}
- Percentage: ${symbolExposurePercentage.toFixed(2)}% of total balance
- Available Capital (to 20% limit): $${availableCapital.toFixed(2)}
- Open Orders: ${symbolOrders.length}

Risk Level: ${riskLevel}

Recommendation: ${recommendation}

Risk Management Note: Maximum single-asset margin should not exceed 20% of account balance.`;

    } catch (error) {
      console.error('[DB] TOOL ERROR in calculate_portfolio_risk:');
      
      if (error instanceof Error) {
        console.error(`[DB] Error name: ${error.name}`);
        console.error(`[DB] Error message: ${error.message}`);
        console.error(`[DB] Error code: ${(error as any).code}`);
        console.error(`[DB] Stack: ${error.stack}`);
        
        return `Error calculating portfolio risk: ${error.message}`;
      } else {
        console.error(`[DB] Unknown error:`, error);
        return `Error calculating portfolio risk: Unknown error`;
      }
    }
  },
});