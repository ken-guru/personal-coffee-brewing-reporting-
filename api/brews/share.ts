import { put } from '@vercel/blob';
import type { IncomingMessage, ServerResponse } from 'http';

// Minimal helper types for Vercel Functions (no @vercel/node dependency needed)
type VReq = IncomingMessage & { body?: unknown; query?: Record<string, string | string[]> };
type VRes = ServerResponse & {
  status: (code: number) => VRes;
  json: (data: unknown) => void;
};

function generateShareId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older Node.js versions
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export default async function handler(req: VReq, res: VRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body as Record<string, unknown> | null;

    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    // Validate required brew fields
    const { coffeeProducer, countryOfOrigin, brewingMethod, rating } = body;
    if (!coffeeProducer || !countryOfOrigin || !brewingMethod || rating === undefined) {
      res.status(400).json({ error: 'Missing required fields: coffeeProducer, countryOfOrigin, brewingMethod, rating' });
      return;
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
      return;
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      res.status(503).json({ error: 'Storage not configured' });
      return;
    }

    // Build the share URL from the request headers first, before writing to storage
    const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https';
    const host = (req.headers['x-forwarded-host'] as string | undefined) ?? req.headers.host;
    if (!host) {
      res.status(500).json({ error: 'Unable to determine server host for share URL' });
      return;
    }
    const baseUrl = `${proto}://${host}`;

    const shareId = generateShareId();
    const sharedAt = new Date().toISOString();

    // Store only anonymous brew data — exclude the user's local id and timestamps
    const sharedBrew = {
      shareId,
      sharedAt,
      brew: {
        coffeeProducer: body.coffeeProducer,
        countryOfOrigin: body.countryOfOrigin,
        coffeeVariety: body.coffeeVariety,
        grindCoarseness: body.grindCoarseness,
        grindEquipment: body.grindEquipment,
        brewingMethod: body.brewingMethod,
        gramsOfCoffee: body.gramsOfCoffee,
        millilitersOfWater: body.millilitersOfWater,
        waterSource: body.waterSource,
        numberOfPeople: body.numberOfPeople,
        brewTimeSeconds: body.brewTimeSeconds,
        rating: body.rating,
        comment: body.comment,
        guestRatings: Array.isArray(body.guestRatings) ? body.guestRatings : [],
      },
    };

    await put(`brew-${shareId}.json`, JSON.stringify(sharedBrew), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    res.status(201).json({
      shareId,
      shareUrl: `${baseUrl}/shared/${shareId}`,
      sharedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error sharing brew:', message);
    res.status(500).json({ error: 'Failed to share brew' });
  }
}
