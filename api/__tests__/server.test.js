const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');
const jwtDecode = require('jwt-decode');
const { users, tech_items } = require('../data/sample-data');

const marlin = { username: 'marlin', password: '1234', role_id: 1 }; // owners
// const crush = { username: 'crush', password: '1234', role_id: 1 };
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
    it('[14] on SUCCESS reponds with status 200 and list of tech items', async () => {
      const buzz = users[1];
      const { body } = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      const { token } = body;
      const res = await request(server).get('/api/tech_items').set('authorization', token);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(tech_items.length);
    });
    it('[15] on SUCCESS reponds with tech_items list in correct format', async () => {
      const woody = users[0];
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const res = await request(server).get('/api/tech_items').set('authorization', token);
      expect(res.status).toBe(200);
      // const sony = tech_items[0];
      expect(res.body[0]).toMatchObject({
        "tech_item_id": 1,
        "tech_item_title": "Sony 8k QLED Smart TV",
        "tech_item_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "tech_item_price": "100.00",
        "min_rental_period": 24,
        "max_rental_period": 72,
        "category_id": 1,
        "owner_id": 1,
        "username": "woody",
        "category_name": "TV & Video" });
    });
    it('[16] on FAIL due to no token, responds with `token required`', async () => {
      const res = await request(server).get('/api/tech_items');
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ message: /token required/i });
    });
  });
  describe('[GET] /api/tech_items/:itech_item_id', () => {
    it('[17] on SUCCESS reponds with status 200', async () => {
      const buzz = users[1];
      const { body } = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      const { token } = body;
      const res = await request(server).get(`/api/tech_items/${1}`).set('authorization', token);
      expect(res.status).toBe(200);
    });
    it('[18] on SUCCESS reponds with tech_item in correct format', async () => {
      const buzz = users[1];
      const { body } = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      const { token } = body;
      const res = await request(server).get(`/api/tech_items/${1}`).set('authorization', token);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        "tech_item_id": 1,
        "tech_item_title": "Sony 8k QLED Smart TV",
        "tech_item_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "tech_item_price": "100.00",
        "min_rental_period": 24,
        "max_rental_period": 72,
        "category_id": 1,
        "owner_id": 1,
        "username": "woody",
        "category_name": "TV & Video" });
    });
    it('[19] on FAIL due to `tech_item_id` not existing responds with status 404 and { "message": "tech_item was not found" }', async () => {
      const buzz = users[1];
      const { body } = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      const { token } = body;
      const res = await request(server).get(`/api/tech_items/${9999}`).set('authorization', token);
      expect(res.body).toMatchObject({ message: "tech_item was not found" });
    });
    it('[20] on FAIL due to no token, responds with `token required`', async () => {
      const res = await request(server).get(`/api/tech_items/${1}`);
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ message: /token required/i });
    });
  });
  describe('[POST] /api/tech_items', () => {
    it('[21] on SUCCESS responds with status 201 and the newly created tech_item', async () => {
      const buzz = users[1];
      const input = {
        tech_item_title: "Tech Item Title",
        tech_item_description: "Tech Item Description",
        tech_item_price: 110.00,
        min_rental_period: 24,
        max_rental_period: 168,
        category_name: "Virtual Reality"
      }
      const { body } = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      const { token } = body;
      const res = await request(server).post(`/api/tech_items`).set('authorization', token).send(input);
      const actual = res.body;
      const expected = {
        ...input,
        tech_item_price: "110.00",
        tech_item_id: 9,
        owner_id: 2,
        username: buzz.username
      }
      expect(actual).toMatchObject(expected);
      expect(res.status).toBe(201);
    });
    it('[22] on SUCCESS if new category is set, responds with status 201 and the newly created tech_item and add new category ', async () => {
      const buzz = users[1];
      const input = {
        tech_item_title: "Tech Item Title",
        tech_item_description: "Tech Item Description",
        tech_item_price: 110.00,
        min_rental_period: 24,
        max_rental_period: 168,
        category_name: "Entertainment"
      }
      const { body } = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      const { token } = body;
      const res = await request(server).post(`/api/tech_items`).set('authorization', token).send(input);
      const actual = res.body;
      const expected = {
        ...input,
        tech_item_price: "110.00",
        tech_item_id: 9,
        owner_id: 2,
        username: buzz.username
      }
      expect(actual).toMatchObject(expected);
      expect(actual.category_id).toEqual(8);
      expect(res.status).toBe(201);
    });
    test('[23] on FAIL due to missing field responds with status 400 and { message: "tech_item_title, tech_item_description, tech_item_price, min_rental_period max_rental_period, category_name are required" }', async () => {
      const buzz = users[1];
      const input = {
        tech_item_title: "Tech Item Title",
        tech_item_description: "Tech Item Description",
        /* missing price */
        min_rental_period: 24,
        max_rental_period: 168,
        category_name: "Virtual Reality"
      }
      const { body } = await request(server).post('/api/auth/login').send({ username: buzz.username, password: '1234' });
      const { token } = body;
      const res = await request(server).post(`/api/tech_items`).set('authorization', token).send(input);
      expect(res.body).toMatchObject({ message: "tech_item_title, tech_item_description, tech_item_price, min_rental_period max_rental_period, category_name are required" });
      expect(res.status).toBe(400);
    });
  });
  describe('[PUT] /api/tech_items/:tech_item_id/owners/:owner_id', () => {
    test('[24] on SUCCESS if a new category is set, responds with status 200 and the updated tech_item with the new category', async () => {
      const woody = users[0];
      const input = {
        tech_item_title: "New Tech Item Title",
        tech_item_description: "New Tech Item Description",
        tech_item_price: 110.00,
        min_rental_period: 24,
        max_rental_period: 168,
        category_name: "Entertainment"
      }
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const tech_item_id = 1;
      const owner_id = 1;
      const res = await request(server).put(`/api/tech_items/${tech_item_id}/owners/${owner_id}`).set('authorization', token).send(input);
      const actual = res.body;
      const expected = {
        ...input,
        tech_item_id: 1,
        owner_id: 1,
        tech_item_price: "110.00",
        username: woody.username
      }
      expect(actual).toMatchObject(expected);
      expect(res.status).toBe(200);
    });
    test('[25] on SUCCESS responds with status 200 and the updated tech_item', async () => {
      const woody = users[0];
      const input = {
        tech_item_title: "New Tech Item Title",
        tech_item_description: "New Tech Item Description",
        tech_item_price: 110.00,
        min_rental_period: 24,
        max_rental_period: 168,
        category_name: "Virtual Reality"
      }
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const tech_item_id = 1;
      const owner_id = 1;
      const res = await request(server).put(`/api/tech_items/${tech_item_id}/owners/${owner_id}`).set('authorization', token).send(input);
      const actual = res.body;
      const expected = {
        ...input,
        tech_item_id: 1,
        tech_item_price: "110.00",
        owner_id: 1,
        username: woody.username
      }
      expect(actual).toMatchObject(expected);
      expect(res.status).toBe(200);
    });
    test('[26] on FAIL due to missing field responds with status 400 and { message: "tech_item_title, tech_item_description, tech_item_price, min_rental_period max_rental_period, category_name are required" }', async () => {
      const woody = users[0];
      const input = {
        tech_item_title: "New Tech Item Title",
        tech_item_description: "New Tech Item Description",
        /* missing price */
        min_rental_period: 24,
        max_rental_period: 168,
        category_name: "Virtual Reality"
      }
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const tech_item_id = 1;
      const owner_id = 1;
      const res = await request(server).put(`/api/tech_items/${tech_item_id}/owners/${owner_id}`).set('authorization', token).send(input);
      const actual = res.body;
      const expected = {
        message: "tech_item_title, tech_item_description, tech_item_price, min_rental_period max_rental_period, category_name are required"
      }
      expect(res.status).toBe(400);
      expect(actual).toMatchObject(expected);
    });
  });
  describe('[DELETE] /api/tech_items/:tech_item_id/owners/:owner_id', () => {
    test('[27] on SUCCESS responds with status 200 and the `tech_item_id` of deleted `tech_item`', async () => {
      const woody = users[0];
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const tech_item_id = 1;
      const owner_id = 1;
      const res = await request(server).delete(`/api/tech_items/${tech_item_id}/owners/${owner_id}`).set('authorization', token);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ tech_item_id: "1" });
    });
    test('[28] on FAIL due to `tech_item_id` not existing responds with status 404 and { "message": "tech_item was not found" }', async () => {
      const woody = users[0];
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const tech_item_id = 1999;
      const owner_id = 1;
      const res = await request(server).delete(`/api/tech_items/${tech_item_id}/owners/${owner_id}`).set('authorization', token);
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: "tech_item was not found" });
    });
  });
  describe('[GET] /api/categories', () => {
    test('[29] on SUCCESS responds with status 200 and list of tech_items by category', async () => {
      const woody = users[0];
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const res = await request(server).get('/api/categories').set('authorization', token);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject([
        { category_id: 1, category_name: 'TV & Video' },
        { category_id: 2, category_name: 'Home Audio & Theater' },
        { category_id: 3, category_name: 'Camera, Photo & Video' },
        { category_id: 4, category_name: 'Gaming' },
        { category_id: 5, category_name: 'Car Electronics' },
        { category_id: 6, category_name: 'Musical Intruments & DJ Equipment' },
        { category_id: 7, category_name: 'Virtual Reality' }
      ]);
    });
  });
  describe('[GET] /api/categories/:category_id', () => {
    test('[29] on SUCCESS responds with status 200 and list of tech_items by category', async () => {
      const woody = users[0];
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const category_id = 1;
      const res = await request(server).get(`/api/categories/${category_id}`).set('authorization', token);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ category_id: 1, category_name: 'TV & Video' });
    });
    test('[30] on FAIL due to `category_id` not found responds with status 404 and { message: "category was not found" }', async () => {
      const woody = users[0];
      const { body } = await request(server).post('/api/auth/login').send({ username: woody.username, password: '1234' });
      const { token } = body;
      const category_id = 100;
      const res = await request(server).get(`/api/categories/${category_id}`).set('authorization', token);
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: "category was not found" });
    });
  });
  describe('[GET] /api/users/:user_id/rentals', () => {
    test('on SUCCESS responds with status 200 and list of `renters` rentals', async () => {
      const zurg = users[6];
      const { body } = await request(server).post(`/api/auth/login`).send({ username: zurg.username, password: '1234' });
      const { token } = body;
      const renter_id = 7;
      const res = await request(server).get(`/api/users/${renter_id}/rentals`).set('authorization', token);
      expect(res.body).toMatchObject([{
        tech_item_title: 'Yamaha Surround Sound 5.1',
        tech_item_description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        tech_item_price: "50.00", 
        min_rental_period: 24,
        max_rental_period: 120,
        category_id: 2,
        category_name: "Home Audio & Theater",
        owner_id: 2,
        owner_name: "buzz",
        renter_id: 7,
        renter_name: "zurg",
        created_at: res.body[0].created_at
      }]);
      expect(res.status).toBe(200);
    });
    test('on FAIL due to user not found, responds with status 404 and { message: "user was not found" }', async () => {
      const zurg = users[6];
      const { body } = await request(server).post(`/api/auth/login`).send({ username: zurg.username, password: '1234' });
      const { token } = body;
      const renter_id = 100;
      const res = await request(server).get(`/api/users/${renter_id}/rentals`).set('authorization', token);
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: "user was not found" });
    });
    test('on FAIL due to unauthenticated user, responds with status 401 and { message: "Token required" }', async () => {
      const renter_id = 7;
      const res = await request(server).get(`/api/users/${renter_id}/rentals`);
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ message: "Token required" });
    });
  });
  describe('[GET] /api/users/:user_id/rentals/:rental_id', () => {
    test('on SUCCESS responds with status 200 and rented item', async () => {
      const zurg = users[6];
      const { body } = await request(server).post(`/api/auth/login`).send({ username: zurg.username, password: '1234' });
      const { token } = body;
      const renter_id = 7;
      const rental_id = 2;
      const res = await request(server).get(`/api/users/${renter_id}/rentals/${rental_id}`).set('authorization', token);
      expect(res.body).toMatchObject({
        tech_item_title: 'Yamaha Surround Sound 5.1',
        tech_item_description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        tech_item_price: "50.00", 
        min_rental_period: 24,
        max_rental_period: 120,
        category_id: 2,
        category_name: "Home Audio & Theater",
        owner_id: 2,
        owner_name: "buzz",
        renter_id: 7,
        renter_name: "zurg",
        created_at: res.body.created_at
      });
      expect(res.status).toBe(200);
    });
    test('on FAIL due to rental not existing responds with status 404 and { message: "rental was not found" }', async () => {
      const zurg = users[6];
      const { body } = await request(server).post(`/api/auth/login`).send({ username: zurg.username, password: '1234' });
      const { token } = body;
      const renter_id = 7;
      const rental_id = 100;
      const res = await request(server).get(`/api/users/${renter_id}/rentals/${rental_id}`).set('authorization', token);
      expect(res.body).toMatchObject({ message: "rental was not found" });
      expect(res.status).toBe(404);
    });
  });
});