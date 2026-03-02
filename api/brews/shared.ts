import { list, get } from '@vercel/blob';
import type { IncomingMessage, ServerResponse } from 'http';

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

  // When Vercel Blob is not configured (e.g. local dev), return an empty list
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(200).json({ brews: [] });
    return;
  }

  try {
    const access: 'public' | 'private' = process.env.BLOB_ACCESS === 'private' ? 'private' : 'public';
    const { blobs } = await list({ prefix: 'brew-', limit: 50 });

    // Fetch the content of each blob in parallel to get brew summaries
    const results = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const result = await get(blob.url, { access });
          if (!result) return null;
          const text = await new Response(result.stream).text();
          return JSON.parse(text) as unknown;
        } catch {
          return null;
        }
      }),
    );

    // Sort newest-first and remove any nulls from failed fetches
    const brews = (results.filter(Boolean) as Array<{ sharedAt?: string }>).sort(
      (a, b) => new Date(b.sharedAt ?? 0).getTime() - new Date(a.sharedAt ?? 0).getTime(),
    );

    res.status(200).json({ brews });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error listing shared brews:', message);
    res.status(500).json({ error: 'Failed to list shared brews' });
  }
}
