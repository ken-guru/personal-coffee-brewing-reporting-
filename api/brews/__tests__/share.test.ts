// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'http';
import * as blobModule from '@vercel/blob';

// Mock @vercel/blob before importing the handler
vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  list: vi.fn(),
}));

const mockPut = blobModule.put as MockedFunction<typeof blobModule.put>;

// Import the handler after mocking
const { default: handler } = await import('../share.js');

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
    headers: overrides.headers ?? { host: 'example.com' },
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

describe('POST /api/brews/share', () => {
  const originalEnv = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    mockPut.mockResolvedValue({ url: 'https://blob.store/brew-test.json', pathname: 'brew-test.json', contentType: 'application/json', contentDisposition: '' } as ReturnType<typeof mockPut> extends Promise<infer T> ? T : never);
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.BLOB_READ_WRITE_TOKEN;
    } else {
      process.env.BLOB_READ_WRITE_TOKEN = originalEnv;
    }
  });

  it('returns 503 when BLOB_READ_WRITE_TOKEN is not configured', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const req = makeReq({ body: validBrewBody, headers: { host: 'myapp.vercel.app' } });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(503);
    expect(lastBody()).toMatchObject({ error: 'Storage not configured' });
    // Blob must not be written when token is missing
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('returns 405 for non-POST requests', async () => {
    const req = makeReq({ method: 'GET' });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(405);
    expect(lastBody()).toMatchObject({ error: 'Method not allowed' });
  });

  it('returns 400 for missing body', async () => {
    const req = makeReq({ body: null });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect(lastBody()).toMatchObject({ error: 'Invalid request body' });
  });

  it('returns 400 when required fields are missing', async () => {
    const req = makeReq({ body: { coffeeProducer: 'Roaster' } });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect((lastBody() as { error: string }).error).toMatch(/Missing required fields/);
  });

  it('returns 400 when rating is out of range', async () => {
    const req = makeReq({ body: { ...validBrewBody, rating: 6 } });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect((lastBody() as { error: string }).error).toMatch(/Rating must be/);
  });

  it('returns 400 when rating is not a number', async () => {
    const req = makeReq({ body: { ...validBrewBody, rating: 'five' } });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect((lastBody() as { error: string }).error).toMatch(/Rating must be/);
  });

  it('returns 500 when host header is missing', async () => {
    const req = makeReq({ body: validBrewBody, headers: {} });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(500);
    expect((lastBody() as { error: string }).error).toMatch(/host/i);
    // Crucially: blob should NOT have been written
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('stores brew in blob and returns 201 with shareUrl on success', async () => {
    const req = makeReq({
      body: validBrewBody,
      headers: { host: 'myapp.vercel.app', 'x-forwarded-proto': 'https' },
    });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);

    expect(lastStatus()).toBe(201);
    const body = lastBody() as { shareId: string; shareUrl: string; sharedAt: string };
    expect(body.shareUrl).toMatch(/^https:\/\/myapp\.vercel\.app\/shared\//);
    expect(body.shareId).toBeTruthy();
    expect(body.sharedAt).toBeTruthy();
    expect(mockPut).toHaveBeenCalledOnce();
    // Blob key should start with "brew-"
    const [blobKey] = mockPut.mock.calls[0];
    expect(blobKey).toMatch(/^brew-.+\.json$/);
  });

  it('does not include local id or timestamps in the stored payload', async () => {
    const req = makeReq({
      body: { ...validBrewBody, id: 'local-id-123', createdAt: '2024-01-01', updatedAt: '2024-01-02' },
      headers: { host: 'myapp.vercel.app' },
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

  it('returns 500 when blob storage throws', async () => {
    mockPut.mockRejectedValueOnce(new Error('Blob store error'));
    const req = makeReq({
      body: validBrewBody,
      headers: { host: 'myapp.vercel.app' },
    });
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(500);
    expect((lastBody() as { error: string }).error).toMatch(/Failed to share brew/);
  });
});
