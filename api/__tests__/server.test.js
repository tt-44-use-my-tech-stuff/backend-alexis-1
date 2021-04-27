const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');
const jwtDecode = require('jwt-decode');
const { users, tech_items } = require('../data/sample-data');

const marlin = { username: 'marlin', password: '1234', role_id: 1 }; // owners
const crush = { username: 'crush', password: '1234', role_id: 1 };
const gill = { username: 'gill', password: '1234', role_id: 2 }; // renters
// const darla = { username: 'darla', password: '1234', role_id: 2 };

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db.seed.run()
})
afterAll(async (done) => {
  await db.destroy()
  done()
})

it('sanity check', () => {
  expect(true).not.toBe(false)
})

describe('server.js', () => {
  it('is the correct testing environment', async () => {
    expect(process.env.NODE_ENV).toBe('testing')
  });
  describe('[POST] /api/auth/register', () => {
    it('[1] on SUCCESS responds with status 201', async () => {
      const res = await request(server).post('/api/auth/register').send(marlin);
      expect(res.status).toBe(201);
    });
    it('[2] on SUCCESS properties `user_id`, `username`, `role_name`', async () => {
      const res = await request(server).post('/api/auth/register').send(marlin);
      expect(res.body).toHaveProperty('user_id');
      expect(res.body).toHaveProperty('role_name');
      expect(res.body).toHaveProperty('username');
    });
    it('[3] on SUCCESS responds with newly created user in correct format', async () => {
      const res = await request(server).post('/api/auth/register').send(marlin);
      expect(res.body).toMatchObject({ user_id: 11, role_name: 'owner', username: marlin.username });
    });
    it('[4] on SUCCESS if user has `role_id` 1, reponds with `role_name`: `owner`', async () => {
      const res = await request(server).post('/api/auth/register').send(marlin);
      expect(res.body).toMatchObject({ user_id: 11, role_name: 'owner', username: marlin.username });
    });
    it('[5] on SUCCESS if user has `role_id` 2, reponds with `role_name`: `renter`', async () => {
      const res = await request(server).post('/api/auth/register').send(gill); 
      expect(res.body).toMatchObject({ user_id: 11, role_name: 'renter', username: gill.username });
    });
    it('[6] on FAIL due to username taken, responds with proper status 400 and { "message": "username is taken" }', async () => {
      const takenUser = users[0];
      const res = await request(server).post('/api/auth/register').send(takenUser);
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "username is taken" });
    });
    it('[7] on FAIL due to missing username or password, responds with proper status 400 and { "message": "username and password are required" }', async () => {
      let res;
      res = await request(server).post('/api/auth/register').send({ role_id: 2, username: gill.username });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "username and password are required" });
      
      res = await request(server).post('/api/auth/register').send({ role_id: 2, password: gill.password });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "username and password are required" });
    });
    it('[8] on FAIL due to missing `role_id`, responds with status 400 and { message: "role is required" }', async () => {
      const res = await request(server).post('/api/auth/register').send({ username: 'mr_potato_head', password: '1234' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: /role is required/i });
    });
  });
  describe('[POST] /api/auth/login', () => {
    it('[9] on SUCCESS responds with proper status 200', async () => {
      const buzz = users[1];
      const res = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      expect(res.status).toBe(200);
    });
    it('[10] on SUCCESS responds with `message`, `user_id`, `role_name`, `username`, `token`', async () => {
      const buzz = users[1];
      const res = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      const decoded = jwtDecode(res.body.token);
      expect(decoded).toMatchObject({ subject: 2, role_name: 'owner', username: buzz.username });
      expect(res.body).toMatchObject({ message: /welcome back, buzz/i, role_name: 'owner', username: buzz.username, token: res.body.token });
    });
    it('[11] on FAIL due to missing `username` or `password` responds with status 400 and { message: "username and password are required" }', async () => {
      const buzz = users[1];
      let res;
      res = await request(server).post('/api/auth/login').send({ username: buzz.username });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "username and password are required" });
      
      res = await request(server).post('/api/auth/login').send({ password: '1234' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: "username and password are required" });
    });
    it('[12] on FAIL due to invalid credentials responds with status 401 and { message: "invalid credentials" }', async () => {
      const buzz = users[1];
      const res = await request(server).post('/api/auth/login').send({ username: buzz.username, password: 'fjdfoiwanfawifnweufnawefewijr231353b234r32crc3' });
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ message: /invalid credentials/i });
    });
  })
  describe('[GET] /api/auth/logout', () => {
    it('[13] on SUCCESS responds with proper status 200 and { message: "logged out" }', async () => {
      const buzz = users[1];
      let res;
      res = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      expect(res.status).toBe(200);
      res = await request(server).get('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ message: /logged out/i });
    });
  });
  describe('[GET] /api/tech_items', () => {
    it('on SUCCESS reponds with status 200 and list of tech items', async () => {
      const { body } = await request(server).post('/api/auth/login');
      const { token } = body;
      const res = await request(server).get('/api/tech_items').set('authorization', token);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(tech_items.length);
    });
  });
});
