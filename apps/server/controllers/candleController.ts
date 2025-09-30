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
    const { asset_name, interval } = req.params;
    if (!asset_name || !interval) {
        return res.status(400).json({ error: 'Asset name and interval are required' });
    }

    const viewName = validIntervals[interval];

    if (!viewName) {
        return res.status(400).json({ error: 'Invalid interval' });
    }

    try { 
        const client = await connectDB();
        const query = `
          SELECT bucket, open, high, low, close, quantity
          FROM ${viewName}
          WHERE symbol = $1
          ORDER BY bucket DESC;
        `;
        // Pass the asset_name as the parameter for $1
        const result = await client.query(query, [asset_name]);
        return res.status(200).json(result.rows); // Use result.rows, not just result
    } catch (err) {
        console.error('Error fetching candle data:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};