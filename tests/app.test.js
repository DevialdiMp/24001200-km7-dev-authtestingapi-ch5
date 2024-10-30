const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// INI FILE TESTING YANG SAYA GABUNGKAN DARI 3 FILE TESTING YANG ADA

// TESTING USER
describe('User Controller', () => {
    // clear database
    beforeEach(async () => {
        await prisma.transactions.deleteMany();
        await prisma.bankAccount.deleteMany();
        await prisma.profile.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect(); // disconnet Prisma setelah semua testting sudah doneee
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

// TESTING ACCOUNT
describe('Account Controller', () => {
    // Clear db
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
            const response = await request(app).get('/api/accounts/9999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Akun tidak ditemukan');
        });

        it('mengembalikan 400 jika ID tidak valid', async () => {
            const response = await request(app).get('/api/accounts/invalid_id');
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

// TESTING TRANSAKSI
describe('Transaction Controller', () => {
    // Clear DB
    beforeEach(async () => {
        await prisma.transactions.deleteMany();
        await prisma.bankAccount.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/transactions - Membuat Transaksi', () => {
        it('berhasil membuat transaksi', async () => {
            const senderAccount = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 2000,
                    user: { create: { name: 'Pengirim', email: 'pengirim@mail.com', password: 'hashed_password' } },
                },
            });

            const receiverAccount = await prisma.bankAccount.create({
                data: {
                    accountNumber: '0987654321',
                    balance: 1000,
                    user: { create: { name: 'Penerima', email: 'penerima@mail.com', password: 'hashed_password' } },
                },
            });

            const response = await request(app)
                .post('/api/transactions')
                .send({ senderId: senderAccount.userId, receiverId: receiverAccount.userId, amount: 500 });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.amount).toBe(500);
        });

        it('harus mengembalikan 404 jika akun pengirim tidak ditemukan', async () => {
            const response = await request(app)
                .post('/api/transactions')
                .send({ senderId: 9999, receiverId: 1, amount: 500 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Akun pengirim tidak ditemukan');
        });

        it('harus mengembalikan 404 jika akun penerima tidak ditemukan', async () => {
            const senderAccount = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 2000,
                    user: { create: { name: 'Pengirim', email: 'pengirim@mail.com', password: 'hashed_password' } },
                },
            });

            const response = await request(app)
                .post('/api/transactions')
                .send({ senderId: senderAccount.userId, receiverId: 9999, amount: 500 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Akun penerima tidak ditemukan');
        });

        it('harus mengembalikan 400 jika jumlah tidak valid', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'User',
                    email: 'user@mail.com',
                    password: 'hashed_password',
                },
            });

            const account = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 2000,
                    user: { connect: { id: user.id } },
                },
            });

            const response = await request(app)
                .post('/api/transactions')
                .send({ senderId: account.userId, receiverId: account.userId, amount: -500 });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Jumlah harus lebih besar dari nol');
        });
    });

    describe('GET /api/transactions - Menampilkan Semua Transaksi', () => {
        it('berhasil menampilkan semua transaksi', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'User',
                    email: 'user@example.com',
                    password: 'hashed_password',
                },
            });

            const account = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 2000,
                    user: { connect: { id: user.id } },
                },
            });

            await prisma.transactions.create({
                data: {
                    sender: { connect: { id: account.id } },
                    receiver: { connect: { id: account.id } },
                    amount: 500,
                },
            });

            const response = await request(app).get('/api/transactions');

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/transactions/:id - Menampilkan Transaksi Berdasarkan ID', () => {
        it('berhasil mendapatkan detail transaksi', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'User',
                    email: 'user@example.com',
                    password: 'hashed_password',
                },
            });

            const account = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 2000,
                    user: { connect: { id: user.id } },
                },
            });

            const transaction = await prisma.transactions.create({
                data: {
                    sender: { connect: { id: account.id } },
                    receiver: { connect: { id: account.id } },
                    amount: 500,
                },
            });

            const response = await request(app).get(`/api/transactions/${transaction.id}`);

            expect(response.status).toBe(200);
            expect(response.body.amount).toBe(500);
        });

        it('mengembalikan 404 jika transaksi tidak ditemukan', async () => {
            const response = await request(app).get('/api/transactions/9999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Transaksi tidak ditemukan');
        });

        it('mengembalikan 400 jika ID tidak valid', async () => {
            const response = await request(app).get('/api/transactions/invalid_id');
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Silakan periksa ID transaksi dengan benar');
        });
    });
});