const express = require('express');
const { 
    createAccount, 
    getAllAccounts, 
    getAccountById, 
    updateAccount, 
    deleteAccount 
} = require('../controllers/accountController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Manajemen akun bank
 */

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Membuat akun bank baru untuk pengguna
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               accountNumber:
 *                 type: string
 *                 example: "123456789"
 *               balance:
 *                 type: number
 *                 example: 500000
 *     responses:
 *       201:
 *         description: Akun berhasil dibuat
 *       400:
 *         description: User ID, nomor akun dan saldo wajib diisi
 *       404:
 *         description: User tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan saat membuat akun
 */
router.post('/accounts', createAccount);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Menampilkan semua akun bank
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: Daftar semua akun bank
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   accountNumber:
 *                     type: string
 *                   balance:
 *                     type: number
 *                   userId:
 *                     type: integer
 *       500:
 *         description: Terjadi kesalahan pada data akun
 */
router.get('/accounts', getAllAccounts);

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Menampilkan detail akun berdasarkan ID
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID akun
 *     responses:
 *       200:
 *         description: Detail akun
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 accountNumber:
 *                   type: string
 *                 balance:
 *                   type: number
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 sentTransactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 receivedTransactions:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: ID pengguna tidak valid
 *       404:
 *         description: Akun tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
router.get('/accounts/:id', getAccountById);

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Memperbarui data akun bank
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID akun
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 example: "987654321"
 *               balance:
 *                 type: number
 *                 example: 1000000
 *               userId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Akun berhasil diperbarui
 *       400:
 *         description: Silakan periksa ID pengguna dengan benar
 *       404:
 *         description: Akun atau user tidak ditemukan
 *       500:
 *         description: Gagal memperbarui akun
 */
router.put('/accounts/:id', updateAccount);

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Menghapus akun bank
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID akun
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
 *       400:
 *         description: Silakan periksa ID pengguna dengan benar
 *       404:
 *         description: Akun tidak ditemukan
 *       500:
 *         description: Gagal menghapus akun
 */
router.delete('/accounts/:id', deleteAccount);

module.exports = router;
