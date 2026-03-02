// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'http';
import * as blobModule from '@vercel/blob';

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
}));

const mockList = blobModule.list as MockedFunction<typeof blobModule.list>;
const mockGet = blobModule.get as MockedFunction<typeof blobModule.get>;

const { default: handler } = await import('../shared.js');

// ── helpers ──────────────────────────────────────────────────────────────────

function makeReq(method = 'GET'): IncomingMessage & { body?: unknown } {
  return { method, headers: {}, body: undefined } as unknown as IncomingMessage & { body?: unknown };
}

function makeRes(): {
  res: ServerResponse & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  lastStatus: () => number;
  lastBody: () => unknown;
} {
  let lastStatus = 200;
  let lastBody: unknown;
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

const mockBrewBlob = (sharedAt: string, coffeeProducer: string) => ({
  shareId: 'test-id',
  sharedAt,
  brew: { coffeeProducer, countryOfOrigin: 'Ethiopia', brewingMethod: 'pour-over', rating: 4 },
});

function makeGetResult(data: unknown) {
  const json = JSON.stringify(data);
  const encoded = new TextEncoder().encode(json);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });
  return {
    statusCode: 200 as const,
    stream,
    headers: new Headers(),
    blob: {
      url: 'https://blob.store/brew-test.json',
      downloadUrl: 'https://blob.store/brew-test.json?download=1',
      pathname: 'brew-test.json',
      contentDisposition: 'inline; filename="brew-test.json"',
      cacheControl: 'public, max-age=31536000',
      uploadedAt: new Date(),
      etag: '"abc123"',
      contentType: 'application/json',
      size: encoded.byteLength,
    },
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/brews/shared', () => {
  const originalEnv = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.BLOB_READ_WRITE_TOKEN;
    } else {
      process.env.BLOB_READ_WRITE_TOKEN = originalEnv;
    }
  });

  it('returns 405 for non-GET requests', async () => {
    const req = makeReq('POST');
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(405);
    expect(lastBody()).toMatchObject({ error: 'Method not allowed' });
  });

  it('returns 200 with empty brews when BLOB_READ_WRITE_TOKEN is missing', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const req = makeReq('GET');
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(200);
    expect(lastBody()).toMatchObject({ brews: [] });
    expect(mockList).not.toHaveBeenCalled();
  });

  it('returns 200 with fetched brews sorted newest-first', async () => {
    const olderBrew = mockBrewBlob('2024-01-01T00:00:00.000Z', 'Older Roaster');
    const newerBrew = mockBrewBlob('2024-06-01T00:00:00.000Z', 'Newer Roaster');

    mockList.mockResolvedValueOnce({
      blobs: [
        { url: 'https://blob.store/brew-old.json', pathname: 'brew-old.json', downloadUrl: '', size: 0, uploadedAt: new Date(), etag: '' },
        { url: 'https://blob.store/brew-new.json', pathname: 'brew-new.json', downloadUrl: '', size: 0, uploadedAt: new Date(), etag: '' },
      ],
      cursor: undefined,
      hasMore: false,
    });

    // Mock get() for each blob URL
    mockGet
      .mockResolvedValueOnce(makeGetResult(olderBrew))
      .mockResolvedValueOnce(makeGetResult(newerBrew));

    const req = makeReq('GET');
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);

    expect(lastStatus()).toBe(200);
    const { brews } = lastBody() as { brews: Array<{ brew: { coffeeProducer: string } }> };
    expect(brews).toHaveLength(2);
    // Newer brew should come first
    expect(brews[0].brew.coffeeProducer).toBe('Newer Roaster');
    expect(brews[1].brew.coffeeProducer).toBe('Older Roaster');
  });

  it('skips blobs that fail to fetch', async () => {
    const goodBrew = mockBrewBlob('2024-01-01T00:00:00.000Z', 'Good Roaster');

    mockList.mockResolvedValueOnce({
      blobs: [
        { url: 'https://blob.store/brew-bad.json', pathname: 'brew-bad.json', downloadUrl: '', size: 0, uploadedAt: new Date(), etag: '' },
        { url: 'https://blob.store/brew-good.json', pathname: 'brew-good.json', downloadUrl: '', size: 0, uploadedAt: new Date(), etag: '' },
      ],
      cursor: undefined,
      hasMore: false,
    });

    mockGet
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeGetResult(goodBrew));

    const req = makeReq('GET');
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);

    expect(lastStatus()).toBe(200);
    const { brews } = lastBody() as { brews: unknown[] };
    expect(brews).toHaveLength(1);
  });

  it('returns 500 when list() throws', async () => {
    mockList.mockRejectedValueOnce(new Error('Blob list error'));
    const req = makeReq('GET');
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(500);
    expect((lastBody() as { error: string }).error).toMatch(/Failed to list/);
  });
});
