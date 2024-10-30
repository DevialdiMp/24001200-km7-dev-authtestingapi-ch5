const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Account Controller', () => {
    // clear db
    beforeEach(async () => {
        await prisma.bankAccount.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/accounts - Membuat Akun', () => {
        it('berhasil membuat akun', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'devialdimp',
                    email: 'devialdimp@mail.com',
                    password: 'devmp',
                },
            });

            const response = await request(app)
                .post('/api/accounts')
                .send({ userId: user.id, accountNumber: '1234567890', balance: 1000 });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.accountNumber).toBe('1234567890');
        });

        it('harus mengembalikan 404 jika pengguna tidak ditemukan', async () => {
            const response = await request(app)
                .post('/api/accounts')
                .send({ userId: 9999, accountNumber: '1234567890', balance: 1000 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User tidak ditemukan');
        });

        it('harus mengembalikan 400 jika data wajib tidak ada', async () => {
            const response = await request(app).post('/api/accounts').send({ accountNumber: '1234567890' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User ID, nomor akun dan saldo wajib diisi');
        });
    });

    describe('GET /api/accounts - Menampilkan Semua Akun', () => {
        it('berhasil menampilkan semua akun', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'devialdimp',
                    email: 'devialdimp@mail.com',
                    password: 'devmp',
                },
            });

            await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 1000,
                    user: { connect: { id: user.id } },
                },
            });

            const response = await request(app).get('/api/accounts');

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/accounts/:id - Menampilkan Akun Berdasarkan ID', () => {
        it('berhasil mendapatkan detail akun', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'devialdimp',
                    email: 'devialdimp@mail.com',
                    password: 'devmp',
                },
            });

            const account = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 1000,
                    user: { connect: { id: user.id } },
                },
            });

            const response = await request(app).get(`/api/accounts/${account.id}`);

            expect(response.status).toBe(200);
            expect(response.body.accountNumber).toBe('1234567890');
        });

        it('mengembalikan 404 jika akun tidak ditemukan', async () => {
            const response = await request(app).get('/api/accounts/9999'); // ID tidak valid

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Akun tidak ditemukan');
        });

        it('mengembalikan 400 jika ID tidak valid', async () => {
            const response = await request(app).get('/api/accounts/invalid_id'); // Pastikan ini adalah format yang tidak valid
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Silakan periksa ID pengguna dengan benar');
        });
    });

    describe('PUT /api/accounts/:id - Memperbarui Akun', () => {
        it('berhasil memperbarui akun', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'devialdimp',
                    email: 'devialdimp@mail.com',
                    password: 'devmp',
                },
            });

            const account = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 1000,
                    user: { connect: { id: user.id } },
                },
            });

            const response = await request(app)
                .put(`/api/accounts/${account.id}`)
                .send({ userId: user.id, accountNumber: '9876543210', balance: 2000 });

            expect(response.status).toBe(200);
            expect(response.body.accountNumber).toBe('9876543210');
        });

        it('harus mengembalikan 404 jika akun tidak ditemukan', async () => {
            const response = await request(app)
                .put('/api/accounts/9999')
                .send({ userId: 1, accountNumber: '9876543210', balance: 2000 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Akun tidak ditemukan');
        });

        it('harus mengembalikan 404 jika user tidak ditemukan', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'devialdimp',
                    email: 'devialdimp@mail.com',
                    password: 'devmp',
                },
            });

            const account = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 1000,
                    user: { connect: { id: user.id } },
                },
            });

            const response = await request(app)
                .put(`/api/accounts/${account.id}`)
                .send({ userId: 9999, accountNumber: '9876543210', balance: 2000 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User tidak ditemukan');
        });
    });

    describe('DELETE /api/accounts/:id - Menghapus Akun', () => {
        it('berhasil menghapus akun', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'devialdimp',
                    email: 'devialdimp@mail.com',
                    password: 'devmp',
                },
            });

            const account = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 1000,
                    user: { connect: { id: user.id } },
                },
            });

            const response = await request(app).delete(`/api/accounts/${account.id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Akun berhasil dihapus');
        });

        it('harus mengembalikan 404 jika akun tidak ditemukan', async () => {
            const response = await request(app).delete('/api/accounts/9999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Akun tidak ditemukan');
        });
    });
});
