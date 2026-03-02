import { put, BlobAccessError, BlobStoreNotFoundError, BlobStoreSuspendedError, BlobServiceNotAvailable, BlobServiceRateLimited } from '@vercel/blob';
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

    // Use the brew's own id as the share id so that /brew/:id and /shared/:id
    // use the same identifier.  Fall back to a generated uuid only when the
    // client does not supply one (e.g. direct API calls).
    const shareId: string =
      typeof body.id === 'string' && body.id.trim() !== ''
        ? body.id.trim()
        : generateShareId();
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
        guestRatings: Array.isArray(body.guestRatings)
          ? (body.guestRatings as Array<{ id?: unknown; rating?: unknown; comment?: unknown }>).map((g) => ({
              rating: g.rating,
              ...(g.comment !== undefined ? { comment: g.comment } : {}),
            }))
          : [],
      },
    };

    const access: 'public' | 'private' = process.env.BLOB_ACCESS === 'private' ? 'private' : 'public';

    await put(`brew-${shareId}.json`, JSON.stringify(sharedBrew), {
      access,
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,  // resharing the same brew updates the stored blob
    });

    res.status(201).json({
      shareId,
      shareUrl: `${baseUrl}/shared/${shareId}`,
      sharedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error sharing brew:', message);

    if (err instanceof BlobAccessError) {
      res.status(403).json({ error: 'Blob storage access denied. Check that BLOB_READ_WRITE_TOKEN is valid and the store access level matches (set BLOB_ACCESS=private if using a private store).' });
    } else if (err instanceof BlobStoreNotFoundError) {
      res.status(503).json({ error: 'Blob store not found. Ensure the blob store is properly linked to this project.' });
    } else if (err instanceof BlobStoreSuspendedError) {
      res.status(503).json({ error: 'Blob store is suspended.' });
    } else if (err instanceof BlobServiceNotAvailable) {
      res.status(503).json({ error: 'Blob service is temporarily unavailable. Please try again.' });
    } else if (err instanceof BlobServiceRateLimited) {
      res.status(429).json({ error: 'Rate limited. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to share brew' });
    }
  }
}
