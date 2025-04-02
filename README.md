# 📚 Comic Book Tracker

A full-stack MERN application to track your comic book collection — complete with titles, issues, publishers, grades, notes, and cover images.  
Built for collectors who want a clean, fast, and simple way to manage their library.

---

## 🚀 Features

- ✏️ Add, edit, and delete comics  
- 🖼️ Upload cover image URLs with clickable thumbnails  
- 🔍 Click thumbnail to view enlarged image  
- 🔐 Token-based authentication (JWT)  
- 🔒 Protected dashboard (only accessible when logged in)  
- 📱 Responsive layout with clean UI  
- 🛠️ Built with the MERN stack (MongoDB, Express, React, Node.js)

---

## 🖼️ Preview

**Thumbnail View:**
- Comics are listed with bullet-aligned thumbnails  
- Info wraps neatly based on screen size  
- Image expands when clicked

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)  
- **Backend:** Express.js  
- **Database:** MongoDB (Mongoose)  
- **Auth:** JSON Web Tokens (JWT)  
- **Styling:** Vanilla CSS and JSX styles  

---

## 🧪 Local Setup

### Prerequisites
- Node.js and npm  
- MongoDB (local or Atlas)  
- Git

### Clone & Install

```bash
git clone https://github.com/dB-XIX/comic-tracker.git
cd comic-tracker
```

Install dependencies:

```bash
# In root
npm install

# In client folder
cd client
npm install

# In server folder
cd ../server
npm install
```

Create a `.env` file in `/server` with:

```env
MONGO_URI=your_mongo_db_connection_string
JWT_SECRET=your_super_secret_key
```

### Run the app

```bash
# In one terminal window
cd server
npm run dev

# In another terminal
cd client
npm run dev
```

---

## 🔐 Authentication

JWT tokens are issued on login and stored in `localStorage`.  
Tokens expire and are auto-cleared to protect user data.  
Dashboard access is restricted unless a valid token exists.

---

## ✅ To-Do (Next Features)

- 🔝 Top 10 most valuable comics view  
- 📊 Price tracking & trends from eBay API  
- 📌 Comic “Want” list with separate tracking  
- 🔍 Optional sorting/filtering by publisher, grade, or date added  
- 📧 User registration email verification  

---

## 🧑‍💻 Author

**Michael**  
GitHub: [dB-XIX](https://github.com/dB-XIX)  
Working on this as part of a professional software engineering portfolio.  
Reach out if you’re a fellow dev or recruiter!

---

## 📄 License

This project is open for educational and personal use.  
**Commercial use prohibited unless permission granted.**
