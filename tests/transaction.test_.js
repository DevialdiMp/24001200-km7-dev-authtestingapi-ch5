const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
            // Buat akun pengirim
            const senderAccount = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 2000,
                    user: { create: { name: 'Pengirim', email: 'pengirim@mail.com', password: 'hashed_password' } },
                },
            });

            // Buat akun penerima
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
            // Buat pengguna baru
            const user = await prisma.user.create({
                data: {
                    name: 'User',
                    email: 'user@mail.com',
                    password: 'hashed_password',
                },
            });

            // Buat akun bank baru untuk pengguna
            const account = await prisma.bankAccount.create({
                data: {
                    accountNumber: '1234567890',
                    balance: 2000,
                    user: { connect: { id: user.id } },
                },
            });

            // Kirim permintaan untuk membuat transaksi dengan jumlah negatif
            const response = await request(app)
                .post('/api/transactions')
                .send({ senderId: account.userId, receiverId: account.userId, amount: -500 });

            // Periksa status dan pesan yang diharapkan
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Jumlah harus lebih besar dari nol');
        });

    });

    describe('GET /api/transactions - Menampilkan Semua Transaksi', () => {
        it('berhasil menampilkan semua transaksi', async () => {
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
            const response = await request(app).get('/api/transactions/9999'); // ID tidak valid

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Transaksi tidak ditemukan');
        });

        it('mengembalikan 400 jika ID tidak valid', async () => {
            const response = await request(app).get('/api/transactions/invalid_id'); // Pastikan ini adalah format yang tidak valid
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Silakan periksa ID transaksi dengan benar');
        });
    });
});
