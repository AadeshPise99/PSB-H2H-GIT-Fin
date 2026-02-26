const request = require('supertest');
const app = require('../src/server');

describe('Health endpoint', () => {
  it('returns 200 and status message', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
  });
});
