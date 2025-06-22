# Hobby University - Educational Web Application

## About the App

Hobby University is a full-stack educational web application that helps users transform their hobbies into professional careers. The platform offers a structured 3-month trial course with daily video lessons, interactive quizzes, attendance tracking, and certificate generation upon completion.

### Key Features:
- **University-style sign-up and login** with comprehensive user profiles
- **3-month trial course** with daily video lessons and quizzes
- **Attendance tracking** to monitor learning progress
- **Professional certificate generation** upon course completion
- **Progress dashboard** with detailed analytics
- **Responsive design** for all devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **jsPDF & html2canvas** for certificate generation

### Backend & Services
- **Supabase** for:
  - Authentication
  - Database (PostgreSQL)
  - Real-time subscriptions
  - File storage
- **YouTube** for video content hosting

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd educationapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL commands from the provided database setup
   - Update your environment variables with the project credentials

5. **Start the development server**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## License

BSD 3-Clause License - Copyright (c) 2025, paulmicky1 