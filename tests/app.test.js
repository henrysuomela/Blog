const request = require('supertest');

jest.mock('../database', () => ({
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn()
}));

const app = require('../app');

const db = require('../database');

describe('Blog application', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET / redirects anonymous users to login', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
    });

    test('GET /new-post redirects anonymous users to login', async () => {
        const response = await request(app).get('/new-post');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
    });

    test('POST /new-post redirects anonymous users to login', async () => {
        const response = await request(app)
            .post('/new-post')
            .send({ title: 'Test', content: 'Content' });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
    });

    test('GET /admin returns 403 for anonymous users', async () => {
        const response = await request(app).get('/admin');
        expect(response.statusCode).toBe(403);
    });

    test('GET /auth/login returns page', async () => {
        const response = await request(app).get('/auth/login');
        expect(response.statusCode).toBe(200);
    });

    test('GET /auth/register returns page', async () => {
        const response = await request(app).get('/auth/register');
        expect(response.statusCode).toBe(200);
    });

    test('GET /auth/logout redirects to login', async () => {
        const response = await request(app).get('/auth/logout');
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
    });

    test('Login fails for unknown user', async () => {
        db.get.mockImplementation((sql, params, cb) => cb(null, undefined));

        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'missing',
                password: 'wrong'
            });

        expect(response.statusCode).toBe(200);
    });

    test('Registration redirects to login page', async () => {
        db.get.mockImplementation((sql, params, cb) => cb(null, undefined));
        db.run.mockImplementation((sql, params, cb) => cb(null));

        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'newuser',
                password: 'password'
            });

        console.log('STATUS:', response.statusCode);
        console.log('LOCATION:', response.headers.location);
        console.log('BODY:', response.text);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
    });

    test('Home page fetches posts for authenticated users', async () => {
        db.get.mockImplementation((sql, params, cb) => {
            if (sql.includes('sessionId')) {
                cb(null, {
                    username: 'user',
                    sessionId: 'abc'
                });
            }
        });

        db.all.mockImplementation((sql, cb) => {
            cb(null, [
                { title: 'Post 1', content: 'Content' }
            ]);
        });

        const response = await request(app)
            .get('/')
            .set('Cookie', ['sessionId=abc']);

        expect(response.statusCode).toBe(200);
    });

});