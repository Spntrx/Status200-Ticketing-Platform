# Status200 Ticketing Platform

Status 200 – COMP229 Web Application Development team project (Centennial College).
A ticketing web application built with the MERN stack: users register and sign in, create support
tickets and track them; administrators manage all users and tickets.

## Team

| Member | Student ID |
|---|---|
| Avi Balsingh | 300926245 |
| Jemuel Fontila | 301585656 |
| Abdulbasit Mohammadpur | 301539478 |
| Benjamin Shlamovsky-Koroz | 301540398 |
| Rahul Krishnan | 301576537 |

## Tech stack

- **Backend:** Node.js, Express, MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken) and bcrypt password hashing
- **Frontend:** HTML, CSS and JavaScript served from `public/` (login, registration and ticket dashboard)

## Project structure

```
config/        database connection
controllers/   auth, user and ticket logic
middleware/    JWT authentication and role checks
models/        User and Ticket Mongoose schemas
routes/        /api/auth, /api/users, /api/tickets
scripts/       seed.js – creates 1 admin and 10 users plus sample tickets
public/        frontend pages (index.html, dashboard.html)
server.js      Express app entry point
```

## Getting started

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in `MONGO_URI`, `JWT_SECRET` and the admin password.
   Never commit `.env`.
3. (Optional) Seed the database:
   ```
   npm run seed          # add sample admin, users and tickets
   npm run seed:destroy  # remove seeded data
   ```
4. Start the server:
   ```
   npm run dev           # development (nodemon)
   npm start             # production
   ```
   The app runs on `http://localhost:5000` (or the `PORT` in `.env`).

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET /api/users`, `GET /api/users/profile`, `PUT /api/users/profile`, `DELETE /api/users/:id` |
| Tickets | `GET /api/tickets`, `GET /api/tickets/:id`, `POST /api/tickets`, `PUT /api/tickets/:id`, `DELETE /api/tickets/:id` |

Protected routes require an `Authorization: Bearer <token>` header from `/api/auth/login`.

## Workflow

Each feature is built on its own branch (`feature/...`) and merged into `main` through a pull request.
