# Kanban-Board Backend

This backend is built for the React frontend in the parent folder. It exposes:

- `POST /api/auth/signup` (fullname, email, password)
- `POST /api/auth/signin` (email, password)
- `GET /api/tasks` (authenticated user tasks)
- `POST /api/tasks` (create task)
- `PUT /api/tasks/:id` (update task)
- `DELETE /api/tasks/:id` (delete task)

## Setup

1. `cd backend`
2. `npm install`
3. copy `.env.example` to `.env`, update keys as needed
4. `npm run dev` (or `npm start`)

## Runs

- API on `http://localhost:5000`
- matches existing frontend calls to `http://localhost:5000/api/auth` and `/api/tasks`.

## Notes

- `data.sqlite` is created automatically when server starts.
- token is stored in localStorage by frontend and included as `Authorization: Bearer <token>`.
