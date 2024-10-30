const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

describe('User Controller', () => {
    // Ckear DB
    beforeEach(async () => {
        await prisma.transactions.deleteMany();
        await prisma.bankAccount.deleteMany();
        await prisma.profile.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/users - Membuat Pengguna', () => {
        it('berhasil membuat pengguna', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: 'devialdimp', email: 'devialdimp@mail.com', password: 'devmp', bio: 'Programmer' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('devialdimp');
        });

        it('harus mengembalikan 400 jika data wajib tidak ada', async () => {
            const response = await request(app).post('/api/users').send({ email: 'devialdimp@mail.com' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Nama, email, dan password wajib diisi');
        });

        it('harus mengembalikan 409 jika email sudah ada', async () => {
            await prisma.user.create({
                data: {
                    name: 'devialdimp',
                    email: 'devialdimp@mail.com',
                    password: await bcrypt.hash('devmp', 10),
                },
            });

            const response = await request(app)
                .post('/api/users')
                .send({ name: 'New User', email: 'devialdimp@mail.com', password: 'devmp', bio: 'Web Developer' });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Email sudah terdaftar, silakan gunakan email lain!');
        });

        it('menangani kesalahan basis data dengan baik', async () => {
            // Menggunakan email yang sudah ada untuk menguji kesalahan
            await prisma.user.create({
                data: {
                    name: 'error devmp',
                    email: 'errordevmp@mail.com',
                    password: await bcrypt.hash('qwerty', 10),
                },
            });

            const response = await request(app)
                .post('/api/users')
                .send({ name: 'error Devmp', email: 'errordevmp@mail.com', password: 'qwerty' });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Email sudah terdaftar, silakan gunakan email lain!');
        });
    });

    describe('GET /api/users - Mengambil Semua Pengguna', () => {
        it('harus mengembalikan semua pengguna', async () => {
            await prisma.user.createMany({
                data: [
                    { name: 'User 1', email: 'user1@mail.com', password: await bcrypt.hash('password1', 10) },
                    { name: 'User 2', email: 'user2@mail.com', password: await bcrypt.hash('password2', 10) },
                ],
            });

            const response = await request(app).get('/api/users');

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
        });
    });

    describe('GET /api/users/:id - Mengambil Pengguna berdasarkan ID', () => {
        it('harus mengembalikan pengguna berdasarkan ID yang valid', async () => {
            const user = await prisma.user.create({
                data: { name: 'Devmp Test', email: 'devmptest@mail.com', password: await bcrypt.hash('qwerty', 10) },
            });

            const response = await request(app).get(`/api/users/${user.id}`);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Devmp Test');
        });

        it('harus mengembalikan 404 untuk pengguna yang tidak ditemukan', async () => {
            const response = await request(app).get('/api/users/999999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Pengguna tidak ditemukan!');
        });

        it('harus mengembalikan 400 untuk ID tidak valid', async () => {
            const response = await request(app).get('/api/users/invalid_id');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Silakan periksa ID pengguna dengan benar');
        });
    });

    describe('PUT /api/users/:id - Memperbarui Pengguna', () => {
        it('harus memperbarui pengguna yang ada', async () => {
            const user = await prisma.user.create({
                data: { name: 'Devmp Update', email: 'devmpupdate@mail.com', password: await bcrypt.hash('password', 10) },
            });

            const response = await request(app)
                .put(`/api/users/${user.id}`)
                .send({ name: 'Devmp Updated', email: 'devmpupdated@mail.com' });

            expect(response.status).toBe(200);
            expect(response.body.user.name).toBe('Devmp Updated');
        });

        it('harus mengembalikan 404 untuk pengguna yang tidak ada', async () => {
            const response = await request(app)
                .put('/api/users/999999')
                .send({ name: 'Pengguna tidak ada', email: 'penggunatidakada@mail.com' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Pengguna tidak ditemukan!');
        });

        it('harus mengembalikan 400 untuk ID tidak valid', async () => {
            const response = await request(app)
                .put('/api/users/invalid_id')
                .send({ name: 'pengguna tidak valid', email: 'penggunatidakvalid@mail.com' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Silakan periksa ID pengguna dengan benar');
        });
    });

    describe('DELETE /api/users/:id - Menghapus Pengguna', () => {
        it('harus menghapus pengguna yang ada', async () => {
            const user = await prisma.user.create({
                data: { name: 'User Delete', email: 'delete@mail.com', password: await bcrypt.hash('password', 10) },
            });

            const response = await request(app).delete(`/api/users/${user.id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User dan profil berhasil dihapus');
        });

        it('harus mengembalikan 404 untuk pengguna yang tidak ada', async () => {
            const response = await request(app).delete('/api/users/999999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Pengguna tidak ditemukan!');
        });

        it('harus mengembalikan 400 untuk ID tidak valid', async () => {
            const response = await request(app).delete('/api/users/invalid_id');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Silakan periksa ID pengguna dengan benar');
        });
    });
});
