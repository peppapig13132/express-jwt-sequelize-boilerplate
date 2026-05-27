import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import sequelize from '../src/config/database';

const app = createApp();

async function signupUser(email: string, password = 'password123') {
  return request(app).post('/api/auth/signup').send({ email, password });
}

async function loginUser(email: string, password = 'password123') {
  return request(app).post('/api/auth/login').send({ email, password });
}

describe('Auth API', () => {
  beforeAll(async () => {
    await sequelize.sync();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('returns health check on GET /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Express.js server is running!');
  });

  it('registers a new user', async () => {
    const response = await signupUser('user@example.com');

    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.user.email).toBe('user@example.com');
  });

  it('rejects duplicate signup', async () => {
    await signupUser('user@example.com');
    const response = await signupUser('user@example.com');

    expect(response.status).toBe(409);
    expect(response.body.msg).toBe('Email already taken');
  });

  it('rejects invalid signup payload', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      email: 'bad-email',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
  });

  it('logs in and returns token pair', async () => {
    await signupUser('user@example.com');
    const response = await loginUser('user@example.com');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.accessToken).toBeTypeOf('string');
    expect(response.body.refreshToken).toBeTypeOf('string');
  });

  it('uses the same error for unknown email and wrong password', async () => {
    await signupUser('user@example.com');

    const unknownEmail = await loginUser('missing@example.com');
    const wrongPassword = await loginUser('user@example.com', 'wrong-password');

    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.body.msg).toBe(wrongPassword.body.msg);
  });

  it('protects routes without a token', async () => {
    const response = await request(app).get('/api/protected');

    expect(response.status).toBe(401);
    expect(response.body.msg).toBe('Authorization token required');
  });

  it('allows access with a valid access token', async () => {
    await signupUser('user@example.com');
    const loginResponse = await loginUser('user@example.com');

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('user@example.com');
  });

  it('rotates refresh tokens', async () => {
    await signupUser('user@example.com');
    const loginResponse = await loginUser('user@example.com');

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.accessToken).toBeTypeOf('string');
    expect(refreshResponse.body.refreshToken).not.toBe(loginResponse.body.refreshToken);

    const oldTokenResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(oldTokenResponse.status).toBe(401);
  });

  it('revokes refresh token on logout', async () => {
    await signupUser('user@example.com');
    const loginResponse = await loginUser('user@example.com');

    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.ok).toBe(true);

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(refreshResponse.status).toBe(401);
  });

  it('revokes all sessions on logout-all', async () => {
    await signupUser('user@example.com');
    const firstLogin = await loginUser('user@example.com');
    const secondLogin = await loginUser('user@example.com');

    const logoutAllResponse = await request(app)
      .post('/api/auth/logout-all')
      .set('Authorization', `Bearer ${firstLogin.body.accessToken}`);

    expect(logoutAllResponse.status).toBe(200);
    expect(logoutAllResponse.body.revokedCount).toBeGreaterThan(0);

    const firstRefresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: firstLogin.body.refreshToken });

    const secondRefresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: secondLogin.body.refreshToken });

    expect(firstRefresh.status).toBe(401);
    expect(secondRefresh.status).toBe(401);
  });
});
