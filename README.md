# 🏠 Hostel Complaint & Management System

A full-stack **Hostel Management Web Application** that streamlines student complaints, applications, mess fee payments, and administrative workflows.
Built using **Node.js, Express, MongoDB, and EJS**, with separate dashboards for **Students** and **Admins**.

---

## 🚀 Features

### 👨‍🎓 Student Features

* Secure **Sign up & Login**
* Submit hostel **Complaints** with image upload
* Track complaint **status** (Pending / In Process / Solved)
* Apply for hostel-related **applications** (leave, maintenance, etc.)
* View real-time **notifications**
* View **Mess & Hostel Dues**
* **Pay dues** and download **payment receipt**
* Clean, modern **Student Dashboard UI**

---

### 🛠️ Admin Features

* Secure **Admin Login**
* View & manage **all student complaints**
* Update complaint and application **status**
* Generate **mess dues** for UG / PG students in bulk
* Track **paid & unpaid dues**
* Automatic student **notifications** on updates
* Centralized **Admin Dashboard**

---

## 🧩 Tech Stack

**Frontend**

* HTML
* CSS
* EJS (Embedded JavaScript Templates)

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB (Mongoose ODM)

**Other Tools**

* Multer (file uploads)
* Express-session (authentication)
* Git & GitHub

---

## 📁 Project Structure

```
hostel/
│── models/          # Mongoose schemas
│── views/           # EJS templates
│── public/          # CSS, images, uploads
│── routes/          # Express routes
│── config/          # Database config
│── server.js        # Main server file
│── .env             # Environment variables
│── .gitignore
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Sneha2032/Hostel-complaint.git
cd Hostel-complaint
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create `.env` file

```
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

### 4️⃣ Run the application

```bash
npm start
```

Open in browser:

```
http://localhost:3000
```

---

## 🔐 Authentication

* Students login using **Enrollment Number & Password**
* Admin login is handled separately

---

## 📌 Future Enhancements

* Online payment gateway (Razorpay integration)
* Notice Board for hostel announcements
* Role-based access control
* Email/SMS notifications
* Admin analytics dashboard

---

## 👩‍💻 Author

**Sneha Mishra**
B.Tech Student | Web Developer
GitHub: [Sneha2032](https://github.com/Sneha2032)

---

## ⭐ If you like this project

Give it a ⭐ on GitHub — it really helps!
