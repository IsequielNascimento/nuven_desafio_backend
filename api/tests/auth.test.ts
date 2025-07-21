import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Fluxo de Autenticação', () => {
  const credentials = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123'
  };

  const testUser = {
    name: 'Test User',
    ...credentials
  };

  let token: string;

  // Limpa somente os dados do usuário criado nos testes
  beforeAll(async () => {
    const existingUser = await prisma.user.findUnique({ where: { email: credentials.email } });

    if (existingUser) {
      await prisma.$transaction([
        prisma.record.deleteMany({
          where: { dataset: { userId: existingUser.id } }
        }),
        prisma.query.deleteMany({
          where: { userId: existingUser.id }
        }),
        prisma.dataset.deleteMany({
          where: { userId: existingUser.id }
        }),
        prisma.user.delete({
          where: { id: existingUser.id }
        })
      ]);
    }
  });

  // Fecha a conexão com o banco após os testes
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /auth/register - Deve registrar um novo usuário com sucesso', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send(testUser);

    expect(response.status, 'Deve retornar 201').toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(credentials.email);
  });

  it('POST /auth/login - Deve autenticar o usuário e retornar um token JWT', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send(credentials);

    expect(response.status, 'Deve retornar 200 no login').toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  it('GET /me - Deve retornar os dados do usuário autenticado usando o token', async () => {
    expect(token).toBeDefined();

    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status, 'Deve retornar 200 no /me').toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(credentials.email);
  });

  it('GET /me - Deve retornar erro 401 sem token', async () => {
    const response = await request(app).get('/me');
    expect(response.status, 'Deve retornar 401 sem token').toBe(401);
  });

  it('POST /auth/login - Deve falhar com senha incorreta', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: credentials.email, password: 'senhaErrada' });

    expect(response.status, 'Deve retornar 400 com senha inválida').toBe(400);
  });
});
