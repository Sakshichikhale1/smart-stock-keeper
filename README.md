
# 📦 InvenPro — Smart Inventory Management System

A modern, AI-powered Inventory Management System designed for Small and Medium Enterprises (SMEs) to streamline inventory tracking, sales, procurement, and business analytics.

Built with a **Zoho-inspired SaaS UI**, InvenPro transforms traditional inventory tracking into an **intelligent, automated, and insight-driven platform**.

---

## 🌐 Live Demo

👉 **Try InvenPro:**
🔗 [https://inven-pro-inventory.lovable.app/](https://inven-pro-inventory.lovable.app/)

---

## 💻 Run Locally

Follow these steps to run the project on your system:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/invenpro.git
cd invenpro
```

---

### 2️⃣ Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file inside the **backend** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Run the Application

#### Start Backend

```bash
cd backend
npm run dev
```

#### Start Frontend

```bash
cd frontend
npm run dev
```

---

### 5️⃣ Open in Browser

```
http://localhost:5173
```

---

## 🚀 Live Features Overview

### 📊 Dashboard

* Real-time inventory overview
* Total inventory value tracking
* Low-stock & out-of-stock alerts
* Top-selling products insights
* Sales & purchase analytics

---

### 📦 Product Management (CRUD)

* Add, edit, delete products
* Track stock quantity, price, and GST
* Category-wise product organization
* Smart stock status indicators

---

### 🛒 Order Management

* Create **Sales & Purchase Orders**
* Multiple products per order
* Auto inventory deduction/addition
* Order lifecycle tracking
* GST breakdown per order (CGST / SGST / IGST)

---

### 📜 Order History

* Filter by Sales / Purchase
* Search & sort orders
* Status tracking (Pending / Completed / Cancelled)
* Detailed order view with GST summary

---

### 📊 Analytics Dashboard

* Revenue & profit tracking
* Inventory turnover rate
* Top-performing products
* Stock aging analysis
* Pareto (80/20) business insights

---

## 🧠 AI-Powered Features

### 💬 AI Inventory Assistant

Ask natural language questions like:

* “Which products are low in stock?”
* “What should I restock this week?”
* “Which items are not selling?”

---

### 🚨 Smart Predictive Alerts

* Low stock warnings
* Out-of-stock predictions
* Dead stock detection
* Auto-reorder suggestions

---

### ⚡ Auto Purchase Order Generator

* Automatically generates purchase orders
* Suggests suppliers
* Pre-fills reorder quantities based on demand

---

### 📦 Smart Recommendations Engine

* Suggests restocking priorities
* Identifies slow-moving inventory
* Optimizes stock levels

---

## 👥 Supplier & Customer Management

* Supplier CRUD with GSTIN support
* Customer tracking with total purchase history
* Purchase & sales linkage
* Business relationship mapping

---

## 🧾 GST & Invoice System

* GST support (0%, 5%, 12%, 18%, 28%)
* Automatic CGST / SGST / IGST calculation
* HSN/SAC code support
* GST summary dashboard
* Invoice-ready order structure

---

## 📊 Advanced Analytics

* Profit per order tracking
* Inventory value analytics
* Stock vs reorder level comparison
* Sales trends visualization
* CSV export support

---

## 🕒 Activity Timeline

Tracks all system events:

* Product updates
* Order creation
* Stock changes
* Inventory adjustments

---

## 🎨 UI/UX Features

* Zoho-style **clean SaaS interface**
* Sidebar navigation system
* Fully responsive design
* Smooth Framer Motion animations
* Dark / Light mode toggle
* Glassmorphism UI elements
* Semantic color system:

  * 🟢 In Stock
  * 🟡 Low Stock
  * 🔴 Out of Stock

---

## 🛠 Tech Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Other

* JWT Authentication (planned / optional)
* REST APIs
* CSV Export utilities

---

## 🏗 Architecture

```
Frontend (React)
   ↓
API Layer (Node.js / Express)
   ↓
Database (MongoDB)
```

---

## 📈 Business Impact

* Reduces stock-outs
* Improves inventory accuracy
* Automates purchase decisions
* Enhances profit visibility
* Saves manual bookkeeping effort

---

## 🚀 Future Enhancements

* Multi-role access control (Admin / Staff)
* Mobile app (React Native)
* Barcode / QR scanning
* Email invoice automation
* ML-based demand forecasting
* ERP integrations

---

## 📌 Success Metrics

* Faster order processing
* Reduced inventory mismatch
* Increased operational efficiency
* Better decision-making via analytics
* Higher inventory turnover

---

## 👨‍💻 Author

**InvenPro Project**
Smart Inventory System for Modern SMEs

---

## 📜 License

This project is for educational and portfolio demonstration purposes.

