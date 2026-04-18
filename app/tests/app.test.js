const request = require('supertest');
const app = require('../src/index');
const usersRouter = require('../src/routes/users');

beforeEach(() => {
  usersRouter.resetStore();
});

// ── Health ──────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200 with healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /health/ready returns ready: true', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
  });
});

// ── Root ────────────────────────────────────────────────────────────────────

describe('GET /', () => {
  it('returns API info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('cicd-blueprints-api');
  });
});

// ── Users ───────────────────────────────────────────────────────────────────

describe('GET /api/users', () => {
  it('returns list of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });
});

describe('GET /api/users/:id', () => {
  it('returns a single user', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Alice Dev');
  });

  it('returns 404 for unknown user', async () => {
    const res = await request(app).get('/api/users/999');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('User not found');
  });
});

describe('POST /api/users', () => {
  it('creates a new user', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Charlie', role: 'qa' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Charlie');
    expect(res.body.data.id).toBeDefined();
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Only' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/users/:id', () => {
  it('deletes an existing user', async () => {
    const res = await request(app).delete('/api/users/1');
    expect(res.status).toBe(204);
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request(app).delete('/api/users/999');
    expect(res.status).toBe(404);
  });
});
