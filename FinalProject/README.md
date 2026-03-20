# Yumaris

## FinalProject - Auth + Products API Docs

This README documents authentication and products APIs in the `FinalProject` server.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- `bcrypt` for password hashing
- `jsonwebtoken` for JWT creation/verification
- `cookie-parser` for cookie-based auth

## API Modules

- Auth APIs under `/api/auth`
- Products APIs under `/api/products`

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

## Environment Setup

Required environment variables:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/yumaris
USER_JWT_TOKEN=your_super_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

`USER_JWT_TOKEN` is required for all protected routes.

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

## Products Flow

1. Login first using `/api/auth/login`.
2. Use products routes.
3. Public routes: get all, get by id.
4. Protected routes: create, update, delete.

For protected product routes, send one of the following:

- Cookie `userToken` (auto set after login in Postman)
- `Authorization: Bearer <token>` header

## Products Routes

### 1) Create Product (Protected)

- Method: `POST`
- URL: `/api/products`
- Body (JSON):

```json
{
	"name": "iPhone 15",
	"description": "128GB model",
	"price": 79999,
	"stock": 20
}
```

Validation:

- `name` and `price` are required
- `name` min length: 2
- `price` must be a non-negative number
- `stock` must be a non-negative number (if provided)

### 2) Get All Products (Public)

- Method: `GET`
- URL: `/api/products`
- Body: none

### 3) Get Product By Id (Public)

- Method: `GET`
- URL: `/api/products/:id`
- Example URL: `/api/products/67df1f6f7f6a0a26c83c1111`
- Body: none

### 4) Update Product (Protected)

- Method: `PUT`
- URL: `/api/products/:id`
- Body (JSON):

```json
{
	"name": "iPhone 15 Pro",
	"description": "256GB model",
	"price": 99999,
	"stock": 10
}
```

All fields are optional in update, but if sent they must be valid.

### 5) Delete Product (Protected)

- Method: `DELETE`
- URL: `/api/products/:id`
- Body: none

## Products Response Notes

- Create returns created product object.
- Get all returns `count` and `products` list.
- Get by id returns one `product`.
- Update returns updated `product`.
- Delete returns success message.

## Product Postman Quick Test Order

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `POST /api/products`
4. `GET /api/products`
5. Copy `_id` from list
6. `GET /api/products/:id`
7. `PUT /api/products/:id`
8. `DELETE /api/products/:id`

Recommended headers in Postman:

```text
Content-Type: application/json
Authorization: Bearer <token>
```

If login cookie is available, Authorization header is optional.