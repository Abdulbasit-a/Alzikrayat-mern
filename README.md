# Alzikrayat — MERN Edition

A full-stack photo-sharing application (Advanced Web Technologies, Course Project 3), rebuilt from the original
Python/Flask + MySQL version of "الذكريات". Same Arabic right-to-left design, colours (amber `#d97706` on cream),
fonts (Amiri + Cairo) and logo; the stack is now MongoDB + Express + React + Node.
Users register, log in, upload photos, browse a responsive gallery, comment, and delete their own photos and comments.

**Stack:** MongoDB + Mongoose · Express.js · React (Vite) + React Router · Node.js
No meta-frameworks, no admin templates, no CSS framework (the styling is a single hand-written `app.css`).
Server helpers: Joi, cors, dotenv, multer, bcryptjs. Client: axios and the Cairo/Amiri fonts (bundled locally).

## Features

- Arabic, right-to-left interface in the original design; every message (including server errors) is in Arabic
- Register / login with bcrypt-hashed passwords; toolbar shows "مرحباً، *name*" + upload + logout, or login / register buttons
- "Last login" strip (as in the Flask version): the previous login time is stored in MongoDB and shown after the next login
- Photo upload with drag & drop and preview (multer, files in `server/uploads/`, metadata in MongoDB), logged-in users only
- Home page (banner, real counters, latest photos) and a Gallery page with three display styles (list, 4 columns, 3 columns); the choice is remembered
- Photo detail page (`/photos/:id`) with metadata and comments; comments appear instantly, no page reload
- Delete a photo (with its comments and file) or a comment — **owner/author only, checked on the server**
- Loading, error and empty states everywhere

## Project structure

```
server/
├── models/        User.js, Photo.js, Comment.js            (Mongoose schemas)
├── routes/        authRoutes.js, photoRoutes.js, commentRoutes.js
├── controllers/   authController.js, photoController.js, commentController.js
├── middleware/    auth.js, validation.js (Joi), upload.js (multer), errorHandler.js
├── uploads/       stored images (git-ignored)
├── .env.example   copy to .env
└── server.js

client/
├── src/
│   ├── components/  Layout, Navbar, Logo, PhotoCard, PhotoGallery, CommentForm, CommentList,
│   │                LoginForm, RegisterForm, ProtectedRoute, StatusMessage
│   ├── pages/       Home, Gallery, PhotoDetail, LoginRegister, Upload, NotFound
│   ├── context/     AuthContext.jsx (logged-in user in React state + localStorage)
│   ├── utils/       api.js (axios), storage.js, format.js
│   ├── styles/      app.css
│   ├── App.jsx      routes
│   └── main.jsx
├── public/vector.svg   the logo (copied unchanged from the Flask project)
├── index.html
└── vite.config.js      dev proxy: /api and /uploads -> Express
```

## Quick start (Windows)

Make sure MongoDB is running, then double-click **`start.bat`**. It checks/installs the packages (instant when already installed) and creates
`server/.env` if missing, then starts the server and the client and opens http://localhost:3000.

## Running locally (manual)

**Prerequisites:** Node.js 18+ and a MongoDB instance (local `mongod` or a MongoDB Atlas URI).

```bash
# 1. API
cd server
cp .env.example .env        # then edit MONGODB_URI if needed
npm install
npm run dev                 # http://localhost:5000

# 2. Client (in a second terminal)
cd client
npm install
npm run dev                 # http://localhost:3000
```

Open http://localhost:3000. The Vite dev server proxies `/api` and `/uploads` to the API.

### Environment variables (`server/.env`)

| Variable        | Default                                | Purpose                                  |
| --------------- | -------------------------------------- | ---------------------------------------- |
| `MONGODB_URI`   | `mongodb://127.0.0.1:27017/alzikrayat` | MongoDB connection string                |
| `PORT`          | `5000`                                 | Port of the Express API                  |
| `CLIENT_ORIGIN` | `http://localhost:3000`                | Origin allowed by CORS                   |

`.env` is git-ignored — never commit it.

## REST API

| Method | Endpoint                      | Auth | Description                                   | Success / errors            |
| ------ | ----------------------------- | ---- | --------------------------------------------- | --------------------------- |
| POST   | `/api/auth/register`          | –    | Create an account (password 8–72 chars)       | 201 · 400 · 409 (duplicate) |
| POST   | `/api/auth/login`             | –    | Log in; returns the profile + previous login time (`lastLogin`) | 200 · 400 · 401 |
| GET    | `/api/auth/me`                | yes  | Re-check a stored session                     | 200 · 401                   |
| GET    | `/api/photos?limit=n`         | –    | List photos, newest first                     | 200                         |
| GET    | `/api/photos/stats`           | –    | Counters for the home page                    | 200                         |
| GET    | `/api/photos/:id`             | –    | One photo                                     | 200 · 400 · 404             |
| POST   | `/api/photos`                 | yes  | Upload (`multipart/form-data`: photo, title, description) | 201 · 400 · 401 |
| DELETE | `/api/photos/:id`             | yes  | Delete own photo                              | 200 · 401 · 403 · 404       |
| GET    | `/api/photos/:id/comments`    | –    | Comments of a photo, oldest first             | 200 · 404                   |
| POST   | `/api/photos/:id/comments`    | yes  | Add a comment                                 | 201 · 400 · 401 · 404       |
| DELETE | `/api/photos/:id/comments/:commentId` | yes | Delete own comment                      | 200 · 401 · 403 · 404       |

Responses use the shape `{ success, message?, data? }`; validation errors add an `errors` array.

## Authentication — scope and limitations

As required for Project 3, authentication is **basic**: after login the client keeps the user in React state
(and `localStorage`) and sends the user's id in an `x-user-id` header. The server never trusts profile data from
the client — it loads the user from MongoDB on every protected request, and ownership checks use that record.

This is not token-based security: user ids are visible in API responses, so anyone who knows an id could send it.
Replacing this with JWT (signed tokens + protected-route middleware) is the natural upgrade and one of the
optional Bonus Project 4 choices.

## Security notes

- Passwords are hashed with bcrypt (`select: false` on the field, never returned)
- Input is validated server-side with Joi (same rules as the Flask version: letters-only names, email ≤ 100, password 8–72, title ≤ 200, description/comment ≤ 1000) and by Mongoose schemas
- Uploads: images only (JPG/PNG/GIF/WEBP), max 10 MB; the stored file extension is derived from the MIME type, not the user's file name
- Secrets live in `.env`, which is excluded from Git

## Deployment note

In production the client is served separately from the API, so the `/api` and `/uploads` proxy from `vite.config.js`
no longer applies. Serve both behind one domain (reverse proxy) or change `baseURL` in `client/src/utils/api.js`
and `imageUrl` accordingly, and set `CLIENT_ORIGIN` on the server.
