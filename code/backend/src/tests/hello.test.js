import request from 'supertest';
import express from 'express';

const App = express();
import router from '../routes/user.js';

App.use('/', router);

describe('Hello world', () => {
    it('should return a hello message', async () => {
        const res = await request(App).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Hello, world!');
    });
});
