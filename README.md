# 📚 Comic Book Tracker

A full-stack MERN application to manage your comic book collection with searchable filters, eBay sales data, editable entries, and a polished responsive UI.  
Built for serious collectors and professional portfolios alike.

---

## 🚀 Features

- ✏️ Add, edit, and delete comics  
- 🖼️ Upload cover image URLs with clickable thumbnails  
- 🔍 Click thumbnails to enlarge images in a modal  
- 🧠 Auto-detects slabbed/raw status from grade and notes  
- 🔐 JWT-based authentication with protected routes  
- 🎨 Toggle between Light and Dark modes  
- 📊 View eBay average sales price for each comic  
- 📈 Sales trend chart on individual comic detail pages  
- 🔗 Quick link to search for the comic on eBay  
- 🧰 Filter by title, publisher, and slabbed/raw format  
- 🔎 Keyword search (live filter)  
- 📤 Export collection as JSON or CSV  
- 📱 Responsive layout for mobile, tablet, and desktop  

---

## 🖼️ Preview

### 📋 Dashboard View (Add, Search, Filter, Sort)
![Dashboard - Filters & Form](screenshots/dashboard-form-filters.png)

### 🗂️ Collection View (Comic Cards)
![Dashboard - Comic Cards](screenshots/dashboard-cards.png)

### 📘 Comic Detail View (Price + Chart)
![Comic Detail - Info & eBay](screenshots/detail-view-top.png)  
![Comic Detail - Sales Chart](screenshots/detail-view-chart.png)

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), React Router  
- **Backend:** Express.js (Node.js)  
- **Database:** MongoDB (via Mongoose)  
- **Authentication:** JSON Web Tokens (JWT)  
- **Styling:** Vanilla CSS + custom layout  
- **External API:** eBay Browse API (OAuth2)  
- **Charting:** Chart.js via react-chartjs-2  

---

## 🧪 Local Setup

### Prerequisites

- Node.js & npm  
- MongoDB (Atlas or local)  
- GitHub account  
- eBay Developer credentials (for API access)  

### Clone the repo

```bash
git clone https://github.com/dB-XIX/comic-tracker.git
cd comic-tracker
```

### Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### Configure environment

In `/server`, create a `.env` file with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
EBAY_CLIENT_ID=your_ebay_api_client_id
EBAY_CLIENT_SECRET=your_ebay_api_secret
```

---

## ▶️ Run the App

### In two terminals:

```bash
# Terminal 1 (Backend)
cd server
npm run dev
```

```bash
# Terminal 2 (Frontend)
cd client
npm run dev
```

App will be live at:  
[http://localhost:5173](http://localhost:5173)

---

## 🔐 Authentication

- JWT tokens stored in localStorage  
- Token is decoded and validated on protected routes  
- Expired/invalid tokens are auto-cleared  

---

## 🧭 Roadmap

- 💬 Add comment section for each comic  
- 🧾 Full eBay sales history logging  
- 🔝 Top 10 most valuable comics view  
- ✅ "Mark as acquired" toggle for Want List items  
- 📂 Upload real images instead of image URLs  
- 🧠 AI-grade estimation from image and description  

---

## 👤 Author

**Michael**  
GitHub: [dB-XIX](https://github.com/dB-XIX)  
Full-stack software engineer building practical, real-world apps for portfolios and hireability.

---

## 📄 License

This project is open for educational and personal use.  
**Commercial use prohibited unless permission granted.**