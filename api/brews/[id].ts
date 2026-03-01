import { list } from '@vercel/blob';
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
    const { blobs } = await list({ prefix: `brew-${id}.json`, limit: 1 });
    const expectedName = `brew-${id}.json`;
    const blob = blobs.find((b) => b.pathname === expectedName || b.pathname.endsWith(`/${expectedName}`));

    if (!blob) {
      res.status(404).json({ error: 'Brew not found' });
      return;
    }

    const fetchRes = await fetch(blob.url);
    if (!fetchRes.ok) {
      res.status(404).json({ error: 'Brew not found' });
      return;
    }

    const data = await fetchRes.json() as unknown;
    res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error fetching shared brew:', message);
    res.status(500).json({ error: 'Failed to fetch brew' });
  }
}
