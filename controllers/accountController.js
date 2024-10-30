const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Menambahkan Data Akun
exports.createAccount = async (req, res) => {
    const { userId, accountNumber, balance } = req.body;

    if (!userId || !accountNumber || balance === undefined) {
        return res.status(400).json({ message: 'User ID, nomor akun dan saldo wajib diisi' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const account = await prisma.bankAccount.create({
            data: {
                accountNumber,
                balance,
                user: {
                    connect: { id: Number(userId) },
                },
            },
        });
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat akun', details: error.message });
    }
};


// Menampilkan Daftar Akun
exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await prisma.bankAccount.findMany();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada data akun', details: error.message });
    }
};

// Menampilkan Detail Akun Berdasarkan ID
exports.getAccountById = async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Silakan periksa ID pengguna dengan benar' });
    }

    try {
        const account = await prisma.bankAccount.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                sentTransactions: true,
                receivedTransactions: true,
            },
        });

        if (!account) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }

        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan', details: error.message });
    }
};

// Memperbarui Akun Berdasarkan ID
exports.updateAccount = async (req, res) => {
    const { accountNumber, balance, userId } = req.body;
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Silakan periksa ID pengguna dengan benar' });
    }

    try {
        const accountExists = await prisma.bankAccount.findUnique({
            where: { id: Number(id) },
        });

        if (!accountExists) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }

        const userExists = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!userExists) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const account = await prisma.bankAccount.update({
            where: { id: Number(id) },
            data: {
                accountNumber,
                balance,
                user: {
                    connect: { id: Number(userId) },
                },
            },
        });

        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ error: 'Gagal memperbarui akun', details: error.message });
    }
};

// Menghapus Akun
exports.deleteAccount = async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Silakan periksa ID pengguna dengan benar' });
    }

    try {
        const account = await prisma.bankAccount.findUnique({
            where: { id: Number(id) },
            include: {
                sentTransactions: true,
                receivedTransactions: true,
            },
        });

        if (!account) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }

        await prisma.transactions.deleteMany({
            where: {
                senderId: Number(id),
            },
        });

        await prisma.transactions.deleteMany({
            where: {
                receiverId: Number(id),
            },
        });

        await prisma.bankAccount.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: 'Akun berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus akun', details: error.message });
    }
};
