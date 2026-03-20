# Yumaris

## FinalProject - Auth API Docs

This README section documents only the authentication part of the `FinalProject` server.

## Tech Stack (Auth)

- Node.js + Express
- MongoDB + Mongoose
- `bcrypt` for password hashing
- `jsonwebtoken` for JWT creation/verification
- `cookie-parser` for cookie-based auth

## How To Run

1. Open terminal in project root.
2. Go to FinalProject:

```bash
cd FinalProject
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file inside `FinalProject` and add:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/yumaris
USER_JWT_TOKEN=your_super_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

5. Start the server:

```bash
npm run dev
```

or

```bash
npm start
```

Base URL:

```text
http://localhost:8080
```

## Authentication Flow

1. Register a user using `/api/auth/register`.
2. Login using `/api/auth/login`.
3. Server sets `userToken` cookie (httpOnly).
4. Use protected routes (`/api/auth/me`, `/api/auth/logout`) with cookie or Bearer token.

## Auth Routes

### 1) Register

- Method: `POST`
- URL: `/api/auth/register`
- Body (JSON):

```json
{
	"username": "john",
	"email": "john@example.com",
	"password": "123456"
}
```

Validation:

- `username`, `email`, `password` are required
- `username` min length: 2
- `password` min length: 6
- email must be valid format

### 2) Login

- Method: `POST`
- URL: `/api/auth/login`
- Body (JSON):

```json
{
	"email": "john@example.com",
	"password": "123456"
}
```

Validation:

- `email`, `password` are required
- email must be valid format

### 3) Get Current User (Protected)

- Method: `GET`
- URL: `/api/auth/me`
- Body: none

### 4) Logout (Protected)

- Method: `POST`
- URL: `/api/auth/logout`
- Body: none

## Auth Details

- Passwords are hashed with `bcrypt` before saving to DB.
- JWT is signed with `USER_JWT_TOKEN` and expires in `1d`.
- Cookie name is `userToken`.
- Cookie options:
	- `httpOnly: true`
	- `sameSite: "lax"`
	- `secure: true` only in production
- Protected middleware checks token in:
	- `Authorization: Bearer <token>`
	- or cookie `userToken`

## Postman Quick Test Order

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `GET /api/auth/me`
4. `POST /api/auth/logout`

For `POST` requests, set header:

```text
Content-Type: application/json
```