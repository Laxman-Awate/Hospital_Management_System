# 🏥 Hospital Management System



A full-stack **Hospital Management System** built to streamline hospital operations through **role-based access control**, **appointment management**, **billing**, **notifications**, and an **AI-powered appointment assistant**. The project is designed to provide separate workflows for **Admin**, **Patient**, and **Doctor** users while keeping the overall hospital process efficient and organized.

---

## ✨ Features

### 🔐 Authentication
- JWT Authentication
- Secure Login & Registration
- Role-Based Access Control

### 🧑‍💼 Admin
- Manage Patients
- Manage Doctors
- Manage Appointments
- Generate Bills
- View Notifications
- Dashboard

### 🧑‍🦱 Patient
- Register / Login
- Book Appointment
- View My Appointments
- View My Bills
- View Notifications
- AI Appointment Assistant
- Dashboard

### 👨‍⚕️ Doctor
- View Assigned Appointments
- View doctor-specific dashboard
- Limited patient-facing workflow support based on assigned appointments

### 🤖 AI Features
- AI Appointment Booking Assistant
- Natural language appointment booking flow
- Intelligent appointment workflow for collecting booking details step by step

### 🔔 Notifications
- In-app notifications
- Appointment notifications
- Billing notifications
- Scheduled reminder support is present in the backend

> 

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Flask
- SQLAlchemy
- JWT Authentication
- Flask-Mail

### Database
- MySQL

### AI
- Google Gemini API
- LangChain *(mention only if used in your local setup / dependencies)*

---

## 📁 Project Structure

```text
Hospital_Management_System/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
├── Backend/
│   ├── agents/
│   ├── ai_services/
│   ├── config/
│   ├── controllers/
│   ├── migrations/
│   ├── models/
│   ├── notifications/
│   ├── routes/
│   ├── scheduler/
│   ├── services/
│   ├── tools/
│   ├── utils/
│   ├── validators/
│   └── app.py
│
└── README.md
```

---

## 🚀 Installation

### Backend Setup

1. **Navigate to the backend folder**
   ```bash
   cd Backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - **Windows**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS / Linux**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   Create a `.env` file inside `Backend/` and add your configuration values.

6. **Run the Flask server**
   ```bash
   python app.py
   ```

---

### Frontend Setup

1. **Navigate to the frontend folder**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🔐 Environment Variables

Create a `.env` file and configure the following values as needed:

```env
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=hospital_management

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_mail_password

GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
WHISPER_MODEL=whisper-1
```

> .

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Manage doctors, patients, appointments, billing, notifications, and dashboard data |
| Doctor | View assigned appointments and access doctor-specific dashboard workflows |
| Patient | Book appointments, view personal appointments, bills, notifications, and dashboard data |

---

## 📸 Screenshots


![Login](screenshots/login.png)
![Admin Dashboard](screenshots/admin-dashboard.png)
![Patient Dashboard](screenshots/patient-dashboard.png)
![Doctor Dashboard](screenshots/doctor-dashboard.png)
![Appointment Booking](screenshots/appointment-booking.png)
![Billing](screenshots/billing.png)
![Notifications](screenshots/notifications.png)
![AI Assistant](screenshots/ai-assistant.png)

---

## 🔮 Future Improvements

- Email Notifications
- Prescription Management enhancements
- Online Payments
- Video Consultation
- Medical Reports
- Advanced Analytics Dashboard

---

## 📚 Learning Outcomes

This project helped strengthen practical understanding of:

- Full Stack Development
- REST API Design
- Authentication & Authorization
- Role-Based Access Control
- Database Design with MySQL
- SQLAlchemy ORM
- AI Integration in Web Applications
- State Management in React
- Backend Service Architecture

---



---

## 📄 License

This project is licensed under the **MIT License**.

## Demo Data

Run from the `Backend` directory:

```powershell
python seed_demo_data.py
```

This idempotent script adds clearly marked demo users and related appointments, medical records, prescriptions, bills, and notifications without deleting existing non-demo data. All demo accounts use password `Demo@123`.

- Admin: `admin@demo.medicare.local`
- Doctors: `doctor1@demo.medicare.local` through `doctor4@demo.medicare.local`
- Patients: `patient1@demo.medicare.local` through `patient10@demo.medicare.local`
