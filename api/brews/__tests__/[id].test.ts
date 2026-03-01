// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'http';
import * as blobModule from '@vercel/blob';

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  list: vi.fn(),
}));

const mockList = blobModule.list as MockedFunction<typeof blobModule.list>;

const { default: handler } = await import('../[id].js');

// ── helpers ──────────────────────────────────────────────────────────────────

function makeReq(
  method = 'GET',
  id?: string,
): IncomingMessage & { body?: unknown; query?: Record<string, string> } {
  return {
    method,
    headers: {},
    body: undefined,
    query: id ? { id } : {},
  } as unknown as IncomingMessage & { body?: unknown; query?: Record<string, string> };
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

const shareId = 'abc-123-def';
const storedBrew = {
  shareId,
  sharedAt: '2024-03-15T10:00:00.000Z',
  brew: { coffeeProducer: 'Test Roaster', countryOfOrigin: 'Kenya', rating: 4, brewingMethod: 'pour-over' },
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/brews/[id]', () => {
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
    const req = makeReq('POST', shareId);
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(405);
    expect(lastBody()).toMatchObject({ error: 'Method not allowed' });
  });

  it('returns 400 when id is missing', async () => {
    const req = makeReq('GET');
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(400);
    expect(lastBody()).toMatchObject({ error: 'Missing id parameter' });
  });

  it('returns 503 when BLOB_READ_WRITE_TOKEN is missing', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const req = makeReq('GET', shareId);
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(503);
    expect(lastBody()).toMatchObject({ error: 'Storage not configured' });
  });

  it('returns 404 when no blob matches the exact name', async () => {
    mockList.mockResolvedValueOnce({
      blobs: [],
      cursor: undefined,
      hasMore: false,
    });
    const req = makeReq('GET', shareId);
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(404);
    expect(lastBody()).toMatchObject({ error: 'Brew not found' });
  });

  it('returns 404 when the list returns a blob with a different name (prefix collision guard)', async () => {
    // list() returns a blob whose name starts with the prefix but is not an exact match
    mockList.mockResolvedValueOnce({
      blobs: [
        {
          url: 'https://blob.store/brew-abc-123-def-extra.json',
          pathname: `brew-${shareId}-extra.json`,
          downloadUrl: '',
          size: 0,
          uploadedAt: new Date(),
        },
      ],
      cursor: undefined,
      hasMore: false,
    });
    const req = makeReq('GET', shareId);
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(404);
    expect(lastBody()).toMatchObject({ error: 'Brew not found' });
  });

  it('returns 200 with brew data on success', async () => {
    mockList.mockResolvedValueOnce({
      blobs: [
        {
          url: 'https://blob.store/brew-abc-123-def.json',
          pathname: `brew-${shareId}.json`,
          downloadUrl: '',
          size: 0,
          uploadedAt: new Date(),
        },
      ],
      cursor: undefined,
      hasMore: false,
    });

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(storedBrew),
    } as unknown as Response);

    const req = makeReq('GET', shareId);
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);

    expect(lastStatus()).toBe(200);
    const body = lastBody() as typeof storedBrew;
    expect(body.shareId).toBe(shareId);
    expect(body.brew.coffeeProducer).toBe('Test Roaster');
  });

  it('returns 500 when list() throws', async () => {
    mockList.mockRejectedValueOnce(new Error('Blob error'));
    const req = makeReq('GET', shareId);
    const { res, lastStatus, lastBody } = makeRes();
    await handler(req, res as unknown as Parameters<typeof handler>[1]);
    expect(lastStatus()).toBe(500);
    expect((lastBody() as { error: string }).error).toMatch(/Failed to fetch brew/);
  });
});
