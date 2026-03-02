import { get, BlobAccessError, BlobNotFoundError, BlobStoreNotFoundError, BlobStoreSuspendedError, BlobServiceNotAvailable, BlobServiceRateLimited } from '@vercel/blob';
import type { IncomingMessage, ServerResponse } from 'http';
import { checkRateLimit, getClientIp, getBrewRateLimiter } from './_rateLimit.js';

type VReq = IncomingMessage & { body?: unknown; query?: Record<string, string | string[]> };
type VRes = ServerResponse & {
  status: (code: number) => VRes;
  json: (data: unknown) => void;
};

export default async function handler(req: VReq, res: VRes) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const clientIp = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  if (!checkRateLimit(getBrewRateLimiter, clientIp)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const id = (req.query?.id as string | undefined) ?? '';
  if (!id) {
    res.status(400).json({ error: 'Missing id parameter' });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(503).json({ error: 'Storage not configured' });
    return;
  }

  try {
    const access: 'public' | 'private' = process.env.BLOB_ACCESS === 'private' ? 'private' : 'public';
    const result = await get(`brew-${id}.json`, { access });

    if (!result) {
      res.status(404).json({ error: 'Brew not found' });
      return;
    }

    const text = await new Response(result.stream).text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('Failed to parse brew data from blob:', err);
      res.status(500).json({ error: 'Failed to parse brew data' });
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error fetching shared brew:', message);

    if (err instanceof BlobAccessError) {
      res.status(403).json({ error: 'Blob storage access denied' });
    } else if (err instanceof BlobNotFoundError) {
      res.status(404).json({ error: 'Brew not found' });
    } else if (err instanceof BlobStoreNotFoundError) {
      res.status(503).json({ error: 'Blob store not found' });
    } else if (err instanceof BlobStoreSuspendedError) {
      res.status(503).json({ error: 'Blob store is suspended' });
    } else if (err instanceof BlobServiceNotAvailable) {
      res.status(503).json({ error: 'Blob service temporarily unavailable' });
    } else if (err instanceof BlobServiceRateLimited) {
      res.status(429).json({ error: 'Rate limited, please try again later' });
    } else {
      res.status(500).json({ error: 'Failed to fetch brew' });
    }
  }
}
