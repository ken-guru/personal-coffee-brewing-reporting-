// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'http';
import * as blobModule from '@vercel/blob';

// Mock @vercel/blob before importing the handler
vi.mock('@vercel/blob', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vercel/blob')>();
  return {
    ...actual,
    put: vi.fn(),
    list: vi.fn(),
  };
});

const mockPut = blobModule.put as MockedFunction<typeof blobModule.put>;

// Import the handler after mocking
const { default: handler } = await import('../share-batch.js');

// ── helpers ──────────────────────────────────────────────────────────────────

type Headers = Record<string, string | string[] | undefined>;

function makeReq(overrides: {
  method?: string;
  body?: unknown;
  headers?: Headers;
}): IncomingMessage & { body?: unknown; query?: Record<string, string> } {
  return {
    method: overrides.method ?? 'POST',
    body: overrides.body,
    headers: overrides.headers ?? { host: 'example.com', 'content-type': 'application/json' },
  } as unknown as IncomingMessage & { body?: unknown; query?: Record<string, string> };
}

function makeRes(): {
  res: ServerResponse & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  lastStatus: () => number;
  lastBody: () => unknown;
} {
  let lastStatus = 200;
  let lastBody: unknown = undefined;
  const res = {
    status: vi.fn().mockImplementation((code: number) => {
      lastStatus = code;
      return res;
    }),
    json: vi.fn().mockImplementation((body: unknown) => {
      lastBody = body;
    }),
  } as unknown as ServerResponse & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  return { res, lastStatus: () => lastStatus, lastBody: () => lastBody };
}

const validBrewBody = {
  id: 'e35c4040-697a-4e45-92ea-233c6132cd35',
  coffeeProducer: 'Blue Bottle',
  countryOfOrigin: 'Ethiopia',
  brewingMethod: 'pour-over',
  rating: 4,
  grindCoarseness: 'medium',
  grindEquipment: 'Baratza Encore',
  gramsOfCoffee: 15,
  millilitersOfWater: 250,
  waterSource: 'filtered-tap',
  numberOfPeople: 1,
  brewTimeSeconds: 180,
  guestRatings: [],
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/brews/share-batch', () => {
  const originalEnv = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    process.env.APP_URL = 'https://test.vercel.app';
    mockPut.mockResolvedValue({ url: 'https://blob.store/brew-test.json', pathname: 'brew-test.json', contentType: 'application/json', contentDisposition: '' } as ReturnType<typeof mockPut> extends Promise<infer T> ? T : never);
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.BLOB_READ_WRITE_TOKEN;
    } else {
      process.env.BLOB_READ_WRITE_TOKEN = originalEnv;
    }
    delete process.env.APP_URL;
    delete process.env.VERCEL_URL;
  });

  it('returns 405 for non-POST requests', async () => {
    const req = makeReq({ method: 'GET' });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(405);
    expect(lastBody()).toMatchObject({ error: 'Method not allowed' });
  });

  it('returns 415 when Content-Type is not application/json', async () => {
    const req = makeReq({ body: [validBrewBody], headers: { 'content-type': 'text/plain' } });
    const { res, lastStatus } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(415);
  });

  it('returns 400 when body is not an array', async () => {
    const req = makeReq({ body: validBrewBody });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect((lastBody() as { error: string }).error).toMatch(/array/);
  });

  it('returns 400 when body is an empty array', async () => {
    const req = makeReq({ body: [] });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect((lastBody() as { error: string }).error).toMatch(/at least one/i);
  });

  it('returns 400 when body exceeds max batch size', async () => {
    const brews = Array.from({ length: 21 }, () => validBrewBody);
    const req = makeReq({ body: brews });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect((lastBody() as { error: string }).error).toMatch(/20/);
  });

  it('returns 400 when a brew is missing required fields', async () => {
    const req = makeReq({ body: [{ coffeeProducer: 'Roaster' }] });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect((lastBody() as { error: string }).error).toMatch(/index 0/);
  });

  it('returns 400 when a brew has invalid rating', async () => {
    const req = makeReq({ body: [{ ...validBrewBody, rating: 6 }] });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect((lastBody() as { error: string }).error).toMatch(/index 0/);
  });

  it('returns 503 when BLOB_READ_WRITE_TOKEN is not configured', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const req = makeReq({ body: [validBrewBody] });
    const { res, lastStatus } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(503);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('stores all brews and returns 201 with results', async () => {
    const brews = [
      { ...validBrewBody, id: 'id-1', coffeeProducer: 'Roaster A' },
      { ...validBrewBody, id: 'id-2', coffeeProducer: 'Roaster B' },
    ];
    const req = makeReq({ body: brews });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(201);
    const body = lastBody() as { results: Array<{ shareId: string; shareUrl: string; sharedAt: string }> };
    expect(body.results).toHaveLength(2);
    expect(mockPut).toHaveBeenCalledTimes(2);
    // Verify each result has a unique shareId
    expect(body.results[0].shareId).not.toBe(body.results[1].shareId);
    // Verify shareIds are not the local IDs
    expect(body.results[0].shareId).not.toBe('id-1');
    expect(body.results[1].shareId).not.toBe('id-2');
    // Verify shareUrls
    expect(body.results[0].shareUrl).toBe(`https://test.vercel.app/shared/${body.results[0].shareId}`);
  });

  it('does not include local id or timestamps in stored payloads', async () => {
    const req = makeReq({
      body: [{ ...validBrewBody, id: 'local-id', createdAt: '2024-01-01', updatedAt: '2024-01-02' }],
    });
    const { res, lastStatus } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(201);
    const storedJson = mockPut.mock.calls[0][1] as string;
    const stored = JSON.parse(storedJson) as { brew: Record<string, unknown> };
    expect(stored.brew).not.toHaveProperty('id');
    expect(stored.brew).not.toHaveProperty('createdAt');
    expect(stored.brew).not.toHaveProperty('updatedAt');
  });

  it('strips internal id from guest ratings', async () => {
    const req = makeReq({
      body: [{
        ...validBrewBody,
        guestRatings: [{ id: 'g1', rating: 3, comment: 'Nice' }],
      }],
    });
    const { res, lastStatus } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(201);
    const storedJson = mockPut.mock.calls[0][1] as string;
    const stored = JSON.parse(storedJson) as { brew: { guestRatings: Array<Record<string, unknown>> } };
    expect(stored.brew.guestRatings[0]).not.toHaveProperty('id');
    expect(stored.brew.guestRatings[0]).toMatchObject({ rating: 3, comment: 'Nice' });
  });

  it('returns 500 when blob storage throws', async () => {
    mockPut.mockRejectedValueOnce(new Error('Blob store error'));
    const req = makeReq({ body: [validBrewBody] });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(500);
    expect((lastBody() as { error: string }).error).toMatch(/Failed to share brews/);
  });

  it('returns 403 when blob storage throws BlobAccessError', async () => {
    mockPut.mockRejectedValueOnce(new blobModule.BlobAccessError());
    const req = makeReq({ body: [validBrewBody] });
    const { res, lastStatus } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(403);
  });
});
