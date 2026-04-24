# DevCare

DevCare is a simple AI in Healthcare hackathon project organized by **Care Devi**. The goal of this project is to build a clean and practical demo platform that can present healthcare-focused AI ideas through a modern web experience.

The project is split into two parts:

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Django + JWT authentication + REST API

## Team

- **Safal Bhattarai** - Backend and AI Modules
- **Aaditya Sidgel** - Backend and AI Modules
- **Saksham Neupane** - Frontend Developer
- **Rupen Rana Magar** - Frontend Developer

## Project Overview

This project is designed as a hackathon-ready starter for an AI healthcare application. It includes:

- A landing page for the project overview
- Login and registration pages with JWT authentication
- A basic user dashboard
- A Django backend ready for user auth and future AI module integration

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Django, Django REST Framework, SimpleJWT, CORS Headers
- **Database:** SQLite for development

## Features

- Responsive landing page for the healthcare AI project
- JWT-based user registration and login
- Protected dashboard page
- Reusable frontend components for quick hackathon development
- Backend structure ready for AI module expansion

## Repository Structure

```text
DevCare/
├── devcare-client/   # React frontend
└── devcare-server/   # Django backend
```

## Getting Started

### Frontend

```bash
cd devcare-client
npm install
npm run dev
```

### Backend

```bash
cd devcare-server
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## API Endpoints

- `POST /api/auth/register/` - Create a new user and return JWT tokens
- `POST /api/auth/login/` - Login with username and password
- `POST /api/auth/refresh/` - Refresh an access token

## Notes

- The frontend expects the backend to run on `http://127.0.0.1:8000` by default.
- You can override the API URL with `VITE_API_BASE_URL` in the frontend environment.
- This is a hackathon starter project, so the focus is on a clean demo flow and easy expansion.

## Next Steps

- Connect the dashboard to real AI outputs
- Add patient data visualizations
- Build model inference endpoints in the backend
- Expand authentication with profile management
