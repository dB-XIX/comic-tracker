# 📚 Comic Book Tracker

A full-stack MERN application to track your comic book collection — complete with titles, issues, publishers, grades, notes, and cover images.  
Now enhanced with eBay sales data integration, professional UI, and trend tracking prep.  
Built for collectors who want a fast, modern, and smart way to manage their library.

---

## 🚀 Features

- ✏️ Add, edit, and delete comics  
- 🖼️ Upload cover image URLs with clickable thumbnails  
- 🔍 Click thumbnail to view enlarged image  
- 🔐 Token-based authentication (JWT)  
- 🔒 Protected dashboard (only accessible when logged in)  
- 🧠 Auto-detects slabbed/raw status from notes and grade  
- 📈 eBay average sales price per comic (updates once per day)  
- 📊 Sales trend chart (on comic details page)  
- 🔗 eBay search link (perfect for want list items)  
- 📱 Responsive layout with polished UI  
- 🛠️ Built with the MERN stack (MongoDB, Express, React, Node.js)

---

## 🖼️ Preview

**Dashboard View:**
- Card-style layout with title, issue, and grade info  
- Image thumbnails with hover effects  
- Average eBay sale price displayed to the right  

**Comic Detail View:**
- Larger image  
- Price trend chart  
- eBay link for quick browsing

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), React Router  
- **Backend:** Express.js  
- **Database:** MongoDB (Mongoose)  
- **Auth:** JSON Web Tokens (JWT)  
- **Styling:** Vanilla CSS + JSX  
- **External API:** eBay Browse API

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
# Root
npm install

# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

Create a `.env` file in `/server` with:

```env
MONGO_URI=your_mongo_db_connection_string
JWT_SECRET=your_super_secret_key
EBAY_CLIENT_ID=your_ebay_api_client_id
EBAY_CLIENT_SECRET=your_ebay_api_secret
```

### Run the app

```bash
# Terminal 1 - backend
cd server
npm run dev

# Terminal 2 - frontend
cd client
npm run dev
```

---

## 🔐 Authentication

JWT tokens are stored in localStorage and verified on every protected route.  
Token expiration is enforced, and invalid tokens are cleared automatically.

---

## 🧠 Roadmap

- 🧾 Full comic history chart (expand beyond 90-day eBay limit)
- 💾 Store eBay data per comic in DB to track long-term trends
- 🔝 Top 10 most valuable comics section
- 📝 Comic “Want List” view with search and valuation
- 📦 Upload real image files instead of URLs
- 🧭 Filter by publisher, year, grade, slabbed/raw

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
