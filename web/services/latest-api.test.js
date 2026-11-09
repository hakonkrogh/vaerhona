import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getFrontPageProps, getPlaceForPage } = vi.hoisted(() => ({
  getFrontPageProps: vi.fn(),
  getPlaceForPage: vi.fn(),
}));

vi.mock('./front-page', () => ({ getFrontPageProps }));
vi.mock('./place-page', () => ({ getPlaceForPage }));

import { handleLatestRequest as handler } from './latest-api';

function call(query, method = 'GET') {
  const res = {
    headers: {},
    statusCode: 200,
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    },
  };

  return handler({ method, query }, res).then(() => res);
}

describe('/api/latest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('answers the newest snapshot of each front page place', async () => {
    getFrontPageProps.mockResolvedValue({
      places: [
        { name: 'veggli', lastSnapshot: { cuid: 'a' } },
        { name: 'tornes', lastSnapshot: { cuid: 'b' } },
      ],
    });

    const res = await call({});

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ latest: { veggli: 'a', tornes: 'b' } });
    expect(res.headers['Cache-Control']).toBe('no-store');
  });

  it('answers the newest snapshot of one place', async () => {
    getPlaceForPage.mockResolvedValue({
      name: 'veggli',
      lastSnapshot: { cuid: 'a' },
    });

    const res = await call({ place: 'veggli' });

    expect(getPlaceForPage).toHaveBeenCalledWith('veggli');
    expect(res.body).toEqual({ latest: { veggli: 'a' } });
  });

  it('answers 404 for an unknown place', async () => {
    getPlaceForPage.mockResolvedValue(null);

    expect((await call({ place: 'nope' })).statusCode).toBe(404);
  });

  it('refuses a place given twice', async () => {
    const res = await call({ place: ['a', 'b'] });

    expect(res.statusCode).toBe(400);
    expect(getPlaceForPage).not.toHaveBeenCalled();
  });

  it('answers 503 when the places cannot be read', async () => {
    getFrontPageProps.mockResolvedValue({ places: null });

    expect((await call({})).statusCode).toBe(503);
  });

  it('answers 500 when reading fails', async () => {
    getPlaceForPage.mockRejectedValue(new Error('db down'));

    expect((await call({ place: 'veggli' })).statusCode).toBe(500);
  });

  it('only answers GET', async () => {
    const res = await call({}, 'POST');

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('GET');
  });
});
