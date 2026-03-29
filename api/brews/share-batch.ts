import { put, BlobAccessError, BlobStoreNotFoundError, BlobStoreSuspendedError, BlobServiceNotAvailable, BlobServiceRateLimited } from '@vercel/blob';
import type { IncomingMessage, ServerResponse } from 'http';
import { checkRateLimit, getClientIp, shareRateLimiter } from './_rateLimit.js';

type VReq = IncomingMessage & { body?: unknown; query?: Record<string, string | string[]> };
type VRes = ServerResponse & {
  status: (code: number) => VRes;
  json: (data: unknown) => void;
};

/** Maximum number of brews that can be shared in a single batch request. */
const MAX_BATCH_SIZE = 20;

function generateShareId(): string {
  return crypto.randomUUID();
}

interface BrewBody {
  coffeeProducer?: unknown;
  countryOfOrigin?: unknown;
  brewingMethod?: unknown;
  rating?: unknown;
  coffeeVariety?: unknown;
  grindCoarseness?: unknown;
  grindEquipment?: unknown;
  gramsOfCoffee?: unknown;
  millilitersOfWater?: unknown;
  waterSource?: unknown;
  numberOfPeople?: unknown;
  brewTimeSeconds?: unknown;
  comment?: unknown;
  brewingMethodCustom?: unknown;
  guestRatings?: unknown;
}

function validateBrew(body: BrewBody, index: number): string | null {
  const { coffeeProducer, countryOfOrigin, brewingMethod, rating } = body;
  if (!coffeeProducer || !countryOfOrigin || !brewingMethod || rating === undefined) {
    return `Brew at index ${index}: missing required fields (coffeeProducer, countryOfOrigin, brewingMethod, rating)`;
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return `Brew at index ${index}: rating must be a number between 1 and 5`;
  }
  return null;
}

function buildSharedBrew(body: BrewBody) {
  const shareId = generateShareId();
  const sharedAt = new Date().toISOString();
  return {
    shareId,
    sharedAt,
    brew: {
      coffeeProducer: body.coffeeProducer,
      countryOfOrigin: body.countryOfOrigin,
      coffeeVariety: body.coffeeVariety,
      grindCoarseness: body.grindCoarseness,
      grindEquipment: body.grindEquipment,
      brewingMethod: body.brewingMethod,
      brewingMethodCustom: body.brewingMethodCustom,
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
}

export default async function handler(req: VReq, res: VRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const clientIp = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  if (!checkRateLimit(shareRateLimiter, clientIp)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const contentType = (req.headers['content-type'] as string | undefined) ?? '';
  if (!contentType.includes('application/json')) {
    res.status(415).json({ error: 'Content-Type must be application/json' });
    return;
  }

  try {
    const body = req.body as unknown;

    if (!body || !Array.isArray(body)) {
      res.status(400).json({ error: 'Request body must be a JSON array of brews' });
      return;
    }

    if (body.length === 0) {
      res.status(400).json({ error: 'At least one brew is required' });
      return;
    }

    if (body.length > MAX_BATCH_SIZE) {
      res.status(400).json({ error: `Maximum ${MAX_BATCH_SIZE} brews per batch` });
      return;
    }

    // Validate all brews before storing any
    for (let i = 0; i < body.length; i++) {
      const brew = body[i] as BrewBody;
      if (!brew || typeof brew !== 'object') {
        res.status(400).json({ error: `Brew at index ${i}: invalid brew object` });
        return;
      }
      const validationError = validateBrew(brew, i);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      res.status(503).json({ error: 'Storage not configured' });
      return;
    }

    const baseUrl =
      process.env.APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
    if (!baseUrl) {
      res.status(500).json({ error: 'Unable to determine server host for share URL' });
      return;
    }

    const access: 'public' | 'private' = process.env.BLOB_ACCESS === 'private' ? 'private' : 'public';

    const results: Array<{ shareId: string; shareUrl: string; sharedAt: string }> = [];

    for (const brewBody of body as BrewBody[]) {
      const sharedBrew = buildSharedBrew(brewBody);

      await put(`brew-${sharedBrew.shareId}.json`, JSON.stringify(sharedBrew), {
        access,
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      results.push({
        shareId: sharedBrew.shareId,
        shareUrl: `${baseUrl}/shared/${sharedBrew.shareId}`,
        sharedAt: sharedBrew.sharedAt,
      });
    }

    res.status(201).json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error batch sharing brews:', message);

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
      res.status(500).json({ error: 'Failed to share brews' });
    }
  }
}
