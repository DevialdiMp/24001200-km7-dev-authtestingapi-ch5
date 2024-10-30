const express = require('express');
const { 
    createTransaction, 
    getAllTransactions, 
    getTransactionById 
} = require('../controllers/transactionController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Manajemen transaksi antar akun bank
 */

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Mengirimkan uang dari akun pengirim ke akun penerima
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: integer
 *                 example: 1
 *                 description: ID user pengirim
 *               receiverId:
 *                 type: integer
 *                 example: 2
 *                 description: ID user penerima
 *               amount:
 *                 type: number
 *                 example: 100000
 *                 description: Jumlah uang yang akan dikirim
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 *       400:
 *         description: Saldo tidak mencukupi atau jumlah tidak valid
 *       404:
 *         description: Akun pengirim atau penerima tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan dalam melakukan transaksi
 */
router.post('/transactions', createTransaction);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Menampilkan semua data transaksi
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: Daftar semua transaksi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   amount:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   sender:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       accountNumber:
 *                         type: string
 *                   receiver:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       accountNumber:
 *                         type: string
 *       500:
 *         description: Terjadi kesalahan saat mengambil data transaksi
 */
router.get('/transactions', getAllTransactions);

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   get:
 *     summary: Menampilkan detail transaksi berdasarkan ID
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID transaksi
 *     responses:
 *       200:
 *         description: Detail transaksi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 amount:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 sender:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     accountNumber:
 *                       type: string
 *                     senderName:
 *                       type: string
 *                 receiver:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     accountNumber:
 *                       type: string
 *                     receiverName:
 *                       type: string
 *       400:
 *         description: ID transaksi tidak valid
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan saat menampilkan transaksi
 */
router.get('/transactions/:transactionId', getTransactionById);

module.exports = router;
