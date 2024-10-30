const express = require('express');
const {
    authenticate,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Manajemen pengguna dan profil
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Membuat pengguna baru dengan profil
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Devialdi"
 *               email:
 *                 type: string
 *                 example: "devialdi@mail.com"
 *               password:
 *                 type: string
 *                 example: "inipassword"
 *               bio:
 *                 type: string
 *                 example: "Programmer"
 *     responses:
 *       201:
 *         description: Pengguna berhasil dibuat
 *       400:
 *         description: Nama, email, dan password wajib diisi
 *       409:
 *         description: Email sudah terdaftar
 */
router.post('/users', createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Menampilkan semua pengguna dan profil
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Daftar semua pengguna
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   profile:
 *                     type: object
 *                     properties:
 *                       bio:
 *                         type: string
 *       500:
 *         description: Terjadi kesalahan
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Menampilkan pengguna berdasarkan ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pengguna
 *     responses:
 *       200:
 *         description: Detail pengguna
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 profile:
 *                   type: object
 *                   properties:
 *                     bio:
 *                       type: string
 *       400:
 *         description: ID pengguna tidak valid
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
router.get('/users/:userId', getUserById);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Memperbarui data pengguna dan profil
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Devialdi Updated"
 *               email:
 *                 type: string
 *                 example: "devialdiupdated@mail.com"
 *               password:
 *                 type: string
 *                 example: "passwordbaru"
 *               bio:
 *                 type: string
 *                 example: "Web Development"
 *     responses:
 *       200:
 *         description: User dan profil berhasil diperbarui
 *       400:
 *         description: Nama dan email wajib diisi
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Gagal memperbarui user dan profil
 */
router.put('/users/:userId', updateUser);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Menghapus pengguna dan profil
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer  
 *         description: ID pengguna
 *     responses:
 *       200:
 *         description: User dan profil berhasil dihapus
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Gagal menghapus user dan profil
 */
router.delete('/users/:userId', deleteUser);
router.post('/authenticate', authenticate);


module.exports = router;
