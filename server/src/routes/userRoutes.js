const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password_hash
 *       properties:
 *         id:
 *           type: integer
 *           description: 사용자 고유 ID
 *         email:
 *           type: string
 *           format: email
 *           description: 사용자 이메일 주소
 *           example: "student@seoultech.ac.kr"
 *         username:
 *           type: string
 *           description: 사용자명
 *           example: "홍길동"
 *         password_hash:
 *           type: string
 *           description: 암호화된 비밀번호
 *         is_active:
 *           type: boolean
 *           description: 계정 활성화 상태
 *           default: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 계정 생성 일시
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 계정 수정 일시
 *     UserCreate:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password_hash
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "student@seoultech.ac.kr"
 *         username:
 *           type: string
 *           example: "홍길동"
 *         password_hash:
 *           type: string
 *           example: "$2b$10$examplehashedpassword"
 *     UserUpdate:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "홍길동"
 *         email:
 *           type: string
 *           format: email
 *           example: "newemail@seoultech.ac.kr"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 모든 사용자 조회
 *     description: 시스템에 등록된 모든 사용자의 목록을 가져옵니다.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 특정 사용자 조회
 *     description: ID로 특정 사용자의 정보를 조회합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 사용자의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 사용자 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 새 사용자 생성
 *     description: 새로운 사용자 계정을 생성합니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *           examples:
 *             student:
 *               summary: 학생 계정 예시
 *               value:
 *                 email: "student@seoultech.ac.kr"
 *                 username: "서울과기대생"
 *                 password_hash: "$2b$10$examplehashedpassword"
 *     responses:
 *       201:
 *         description: 사용자 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *       400:
 *         description: 잘못된 요청 (이메일 중복 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already exists"
 *       500:
 *         description: 서버 내부 오류
 */
router.post('/', userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: 사용자 정보 수정
 *     description: 기존 사용자의 정보를 수정합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 수정할 사용자의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: 사용자 삭제
 *     description: 사용자 계정을 삭제합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 삭제할 사용자의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 사용자 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;