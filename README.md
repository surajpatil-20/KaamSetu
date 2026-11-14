# 🌉 KaamSetu — On-Demand Service Marketplace

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.15-red?style=flat&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase Storage](https://img.shields.io/badge/Supabase-Storage-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat&logo=render&logoColor=white)](https://render.com/)

> **KaamSetu** (meaning *"Bridge to Work"*) is a full-stack on-demand service marketplace designed to connect customers with skilled local service professionals (painters, plumbers, electricians, carpenters, cleaners, movers, and technicians). Built from the ground up with a focus on real-world workflow automation, location intelligence, security, and responsive UX.

---

## 📸 Overview

```
                      ┌──────────────────────────────────────┐
                      │              KaamSetu                │
                      │   Bridging Customers and Workers     │
                      └──────────────────┬───────────────────┘
                                         │
             ┌───────────────────────────┴───────────────────────────┐
             ▼                                                       ▼
    ┌─────────────────┐                                     ┌─────────────────┐
    │    CUSTOMER     │                                     │     WORKER      │
    ├─────────────────┤                                     ├─────────────────┤
    │ • Post Works    │                                     │ • Explore Jobs  │
    │ • Upload Photos │                                     │ • GPS / Radius  │
    │ • Pick on Map   │                                     │ • Apply & Bid   │
    │ • Review Bids   │                                     │ • Lifecycle     │
    │ • Approve Work  │                                     │ • Build Profile │
    │ • Rate & Review │                                     │ • Earn Reviews  │
    └─────────────────┘                                     └─────────────────┘
```

---

## ⚡ Key Highlights & Metrics

- 🚀 **25+ End-to-End Features** across customer & worker portals
- 🔗 **33 REST API Endpoints** with clean DRF serializers, viewsets, and throttling
- 📄 **20+ Production Frontend Screens** built with React 19 + Vite
- 🛡️ **HttpOnly Cookie JWT Authentication** with token rotation & CSRF protection
- 📱 **Firebase Phone Verification** with secure Django backend signature validation
- 🗺️ **Location Intelligence** with interactive Leaflet maps, GPS geolocation, and Haversine radius matching
- ☁️ **Cloud Storage Integration** with Supabase S3-compatible bucket for high-res photo uploads & profile media

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/) + [Leaflet](https://leafletjs.com/) + OpenStreetMap
- **HTTP Client**: [Axios](https://axios-http.com/) (Centralized interceptor, CSRF headers & credentials)
- **Auth Client**: [Firebase Auth](https://firebase.google.com/docs/auth) (Phone SMS OTP)

### Backend
- **Framework**: [Python 3.12](https://www.python.org/) + [Django 5.2](https://docs.djangoproject.com/)
- **API Engine**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Auth System**: [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/) in secure HttpOnly cookies + CookieJWTAuthentication
- **Database**: [PostgreSQL](https://www.postgresql.org/) with SSL
- **Cloud Storage**: [Supabase Storage](https://supabase.com/storage) via `django-storages` + `boto3`
- **Static Assets**: [WhiteNoise](https://whitenoise.readthedocs.io/)
- **Security**: Granular scoped rate-limiting, CSRF trusted origins, CORS credentials protection

---

## 🌟 Feature Breakdown

### 1. Dual-Role Architecture
- **Customer Portal**: Post jobs, upload requirement photos, set location & budget, manage applications, track execution, approve completion, and leave verified reviews.
- **Worker Portal**: Discover open jobs via GPS distance or category filters, view photo galleries in lightboxes, submit proposed prices & cover notes, manage assigned works, and track earnings & ratings.

### 2. Location & Spatial Discovery
- **Interactive Map Picker**: Click-to-pin work coordinates powered by Leaflet & OpenStreetMap.
- **Reverse Geocoding**: Automatically resolves coordinates to city, full address, and Indian 6-digit PIN codes via Nominatim.
- **Proximity Search**: Haversine distance calculation in Django backend to filter works within 5 km, 10 km, 25 km, or 50 km radii.

### 3. Work Photos & Cloud Storage
- **Requirement Galleries**: Customers upload up to 3 work photos per job (JPG, PNG, WebP ≤ 5 MB).
- **Public Object URLs**: Centralized Supabase storage backend ensures media is publicly streamable without exposing S3 access secrets.
- **Full-Screen Lightbox**: Workers can inspect full-resolution photos before proposing their price.

### 4. Work Lifecycle State Machine
```
[OPEN] ──(Worker Applies)──> [APPLICATIONS PENDING]
   │
   └──(Customer Selects)───> [WORKER SELECTED]
                                   │
                              (Worker Starts)
                                   ▼
                            [IN PROGRESS]
                                   │
                              (Worker Submits)
                                   ▼
                              [SUBMITTED]
                                   │
                             (Customer Approves)
                                   ▼
                              [COMPLETED]
```

### 5. In-App Notifications
- Automated notifications dispatched when:
  - An application is submitted
  - A worker is selected
  - Applications are rejected
  - Work is started or submitted
  - Work is approved and completed
- Real-time unread badge counts and one-click "Mark All as Read".

### 6. Ratings & Verified Reviews
- Customers rate workers with 1–5 stars and qualitative feedback upon completion.
- Dynamic profile aggregation: Average rating calculation and total verified review counters.

---

## 📡 REST API Structure

The backend provides **33 structured REST endpoints**:

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register/` | Register as Customer or Worker |
| | `POST` | `/api/auth/login/` | Issue JWT access & refresh cookies |
| | `POST` | `/api/auth/logout/` | Blacklist tokens & clear cookies |
| | `GET` | `/api/auth/session/` | Check active user session |
| | `GET` | `/api/auth/csrf/` | Obtain CSRF token cookie |
| | `POST` | `/api/auth/verify-phone/` | Verify Firebase phone ID token |
| | `POST` | `/api/auth/forgot-password/` | Send password reset request |
| | `POST` | `/api/auth/verify-otp/` | Verify OTP for password recovery |
| | `POST` | `/api/auth/reset-password/` | Set new password |
| | `POST` | `/api/auth/change-password/` | Authenticated password update |
| | `GET/PATCH` | `/api/auth/profile/` | Fetch and update profile details & avatar |
| **Works** | `GET/POST` | `/api/works/` | List/Create works |
| | `GET` | `/api/works/available/` | Available works with Haversine radius filter |
| | `GET` | `/api/works/my/` | Authenticated user's works |
| | `GET` | `/api/works/<id>/` | Detailed work view with photos |
| | `PATCH/DELETE`| `/api/works/<id>/manage/` | Update or delete customer's work |
| | `POST` | `/api/works/<id>/photos/` | Upload photo to work (max 3, Supabase) |
| | `POST` | `/api/works/<id>/start/` | Worker marks job In-Progress |
| | `POST` | `/api/works/<id>/submit/` | Worker submits completed job |
| | `POST` | `/api/works/<id>/approve/` | Customer approves submitted work |
| **Applications** | `POST` | `/api/applications/<work_id>/` | Worker applies with proposed price |
| | `GET` | `/api/applications/my/` | Worker's applications list |
| | `GET` | `/api/applications/work/<work_id>/`| Customer views applicants for a work |
| | `POST` | `/api/applications/<id>/select/` | Customer selects winning applicant |
| **Reviews** | `GET/POST` | `/api/reviews/work/<work_id>/` | Create or read review for completed work |
| | `GET` | `/api/reviews/worker/<worker_id>/`| Public reviews for worker profile |
| | `GET` | `/api/reviews/my-reviews/` | Reviews history for logged-in user |
| **Notifications**| `GET` | `/api/notifications/` | Paginated notifications list |
| | `POST` | `/api/notifications/<id>/read/` | Mark single notification as read |
| | `POST` | `/api/notifications/read-all/` | Mark all notifications as read |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database
- Supabase account (for Storage bucket)
- Firebase project (for Phone Authentication)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/kaamsetu.git
cd kaamsetu
```

### 2. Backend Setup
```bash
# Navigate to Backend folder
cd Backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file based on .env.example
cp .env.example .env

# Run database migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

App will be live at `http://localhost:5173/` with API proxy configured to backend on `http://127.0.0.1:8000/`.

---

## 🔒 Security & Best Practices

- **Zero-Token Storage in LocalStorage**: JWT tokens are transmitted and stored strictly in **HttpOnly, SameSite cookies**, eliminating XSS token theft risks.
- **CSRF Protection**: All mutating operations enforce Django's CSRF token handshake.
- **Strict Server-Side Validation**: PIN code length, coordinate ranges, image MIME signatures, file sizes, and 3-photo boundaries are enforced in DRF serializers.
- **Atomic Database Transactions**: Work acceptance and status transitions run inside `@transaction.atomic` with `select_for_update()` to prevent race conditions.

---

## 📄 License

This project is licensed under the MIT License. Built with ❤️ by Suraj.
