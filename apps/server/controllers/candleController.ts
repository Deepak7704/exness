// controllers/candleController.ts
import type { Request, Response } from 'express';
import connectDB from '@repo/db/index';

const validIntervals: { [key: string]: string } = {
    '1m': 'candles_1m',
    '5m': 'candles_5m',
    '10m': 'candles_10m',
    '30m': 'candles_30m',
    '1h': 'candles_1h',
    '1d': 'candles_1d'
};

export const getCandles = async (req: Request, res: Response) => {
    // Get URL parameters from route (/api/candles/:asset_name/:interval)
    const { asset_name, interval } = req.params;
    
    // Get query string parameter (?limit=100)
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 1000;

    // Validation
    if (!asset_name || !interval) {
        return res.status(400).json({ 
            error: 'Asset name and interval are required' 
        });
    }

    const viewName = validIntervals[interval];
    if (!viewName) {
        return res.status(400).json({ 
            error: 'Invalid interval',
            validIntervals: Object.keys(validIntervals)
        });
    }

    try { 
        const client = await connectDB();

        // Refresh the materialized view to get latest data
        await client.query(
            `CALL refresh_continuous_aggregate('${viewName}', NULL, NULL)`
        );

        // Fetch candles from the materialized view
        // Use asset_name directly (it will be BTCUSDT, ETHUSDT, or SOLUSDT)
        const result = await client.query(
            `SELECT 
                bucket,
                symbol,
                open,
                high,
                low,
                close,
                quantity as volume
             FROM ${viewName}
             WHERE symbol = $1
             ORDER BY bucket DESC
             LIMIT $2`,
            [asset_name.toUpperCase(), limit]  // Ensure uppercase for consistency
        );

        // Format the response (reverse to get oldest to newest)
        const candles = result.rows.reverse().map((row: any) => ({
            bucket: row.bucket,
            symbol: row.symbol,
            open: parseFloat(row.open),
            high: parseFloat(row.high),
            low: parseFloat(row.low),
            close: parseFloat(row.close),
            volume: parseFloat(row.volume),
        }));

        return res.status(200).json(candles);
    } catch (err) {
        console.error('Error fetching candle data:', err);
        return res.status(500).json({ 
            error: 'Failed to fetch candles',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};