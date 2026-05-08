# 🤖 ResumeAI – AI-Powered Resume Analyzer

A full-stack MERN application that uses **Claude AI** to analyze resumes and provide actionable feedback, ATS scores, keyword analysis, and job-match scoring.

## ✨ Features

- 📄 **Resume Upload** – PDF, DOCX, TXT support with drag-and-drop
- 🤖 **AI Analysis** – Powered by Claude (Anthropic) for deep, contextual feedback
- 📊 **Score Dashboard** – Overall, ATS, and per-section scores with visualizations
- 🎯 **Job Match** – Paste a job description for personalized match scoring
- 🔑 **Keyword Analysis** – Found vs. missing keywords with actionable gaps
- 💡 **AI Suggestions** – Concrete rewrite recommendations
- 📈 **History** – Track all your resumes and score improvements
- 🔐 **Auth** – JWT-based authentication with bcrypt password hashing

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, React Dropzone |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Auth | JWT + Bcrypt |
| File Parsing | pdf-parse, mammoth |
| Styling | Custom CSS with CSS Variables |

## 📁 Project Structure

```
resume-analyzer/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with bcrypt
│   │   └── Resume.js        # Resume + analysis schema
│   ├── routes/
│   │   ├── auth.js          # Register, login, me
│   │   ├── resume.js        # Upload, list, delete
│   │   └── analysis.js      # AI analysis, stats
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── .env.example
│   └── server.js            # Express app entry
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   └── Navbar.js
        ├── context/
        │   └── AuthContext.js    # Global auth state
        ├── pages/
        │   ├── Landing.js
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── Upload.js
        │   ├── Analysis.js
        │   └── History.js
        ├── App.js
        └── index.css
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Anthropic API Key

### 1. Clone & Setup

```bash
git clone https://github.com/adrika-code/AI.Resume.Analyzer.git
cd resume-analyzer
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=your_super_secret_key
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`

## 🔑 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Resume
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/resume/upload` | Upload resume file |
| GET | `/api/resume/all` | Get all user resumes |
| GET | `/api/resume/:id` | Get single resume |
| DELETE | `/api/resume/:id` | Delete resume |

### Analysis
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/analysis/analyze/:id` | Run AI analysis |
| GET | `/api/analysis/:id` | Get analysis result |
| GET | `/api/analysis/stats/overview` | Get user stats |

## 🎯 How It Works

1. User uploads a PDF/DOCX resume
2. Backend extracts text using `pdf-parse` or `mammoth`
3. Text is sent to Claude API with a structured prompt
4. Claude returns JSON with scores, keywords, suggestions
5. Results are saved to MongoDB and displayed in React UI

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Bcrypt password hashing (cost factor 12)
- Rate limiting (100 req/15min)
- Helmet.js security headers
- File type & size validation
- User-scoped data access

## 📸 Key Pages

- **Landing** – Marketing page with feature highlights
- **Dashboard** – Stats overview, recent resumes
- **Upload** – Drag-and-drop with optional job targeting
- **Analysis** – Full score breakdown, charts, AI feedback
- **History** – Resume management with search & delete

## 🚢 Deployment

### Backend (Railway / Render)
1. Set environment variables
2. Connect MongoDB Atlas
3. Deploy Node.js service

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your backend URL
2. Deploy React build

## 👨‍💻 Built With
- [Anthropic Claude](https://anthropic.com) – AI analysis engine
- [MongoDB Atlas](https://mongodb.com/atlas) – Cloud database
- [Express.js](https://expressjs.com) – Backend framework
- [React](https://reactjs.org) – Frontend framework

---

Made with ❤️ using the MERN Stack + Claude AI
