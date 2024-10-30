const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mengirimkan Uang Dari Akun A ke Akun B
exports.createTransaction = async (req, res) => {
    const { senderId, receiverId, amount } = req.body;

    try {
        const senderAccount = await prisma.bankAccount.findFirst({
            where: { userId: Number(senderId) }, // Pastikan untuk menggunakan userId secara langsung
        });

        const receiverAccount = await prisma.bankAccount.findFirst({
            where: { userId: Number(receiverId) }, // Pastikan untuk menggunakan userId secara langsung
        });

        if (!senderAccount) {
            return res.status(404).json({ message: 'Akun pengirim tidak ditemukan' });
        }

        if (!receiverAccount) {
            return res.status(404).json({ message: 'Akun penerima tidak ditemukan' });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Jumlah harus lebih besar dari nol' });
        }

        if (amount > senderAccount.balance) {
            return res.status(400).json({ message: 'Saldo anda tidak mencukupi' });
        }

        const transaction = await prisma.transactions.create({
            data: {
                amount,
                sender: { connect: { id: senderAccount.id } },
                receiver: { connect: { id: receiverAccount.id } },
            },
        });

        await prisma.bankAccount.update({
            where: { id: senderAccount.id },
            data: { balance: senderAccount.balance - amount },
        });

        await prisma.bankAccount.update({
            where: { id: receiverAccount.id },
            data: { balance: receiverAccount.balance + amount },
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan dalam melakukan transaksi' });
    }
};

// Menampilkan Data Transaksi
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transactions.findMany({
            include: { sender: true, receiver: true },
        });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data transaksi' });
    }
};

// Menampilkan Detail Transaksi Berdasarkan ID
exports.getTransactionById = async (req, res) => {
    const { transactionId } = req.params;

    if (isNaN(transactionId)) {
        return res.status(400).json({ message: 'Silakan periksa ID transaksi dengan benar' });
    }

    try {
        const transaction = await prisma.transactions.findUnique({
            where: { id: Number(transactionId) },
            include: {
                sender: {
                    select: {
                        id: true,
                        accountNumber: true,
                        user: { select: { name: true } }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        accountNumber: true,
                        user: { select: { name: true } }
                    }
                },
            },
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }

        const response = {
            id: transaction.id,
            amount: transaction.amount,
            createdAt: transaction.createdAt,
            sender: {
                id: transaction.sender.id,
                accountNumber: transaction.sender.accountNumber,
                senderName: transaction.sender.user.name,
            },
            receiver: {
                id: transaction.receiver.id,
                accountNumber: transaction.receiver.accountNumber,
                receiverName: transaction.receiver.user.name,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menampilkan transaksi' });
    }
};
