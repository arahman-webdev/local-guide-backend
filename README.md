# TourMate – Full Stack Tour Management Platform

A complete backend API for a Travel & Tour Booking Platform built using Node.js, Express, Prisma ORM, PostgreSQL, JWT Authentication, RBAC, SSLCommerz Payment Gateway, and Cloudinary for media uploads.

---

##  Features

# Authentication & Authorization

* JWT Access + Refresh Token flow
* Secure cookies (httpOnly, sameSite, secure)
* Role‑based access (ADMIN, GUIDE, TOURIST)
* Middleware route protection in Next.js

# Tours Management

* Create Tours (Guide)
* Upload images (multiple)
* Edit/Delete Tours
* Search by destination, category, price, date, language
* Explore page with filters

### ❤️ **Wishlist / Favorites**

* Tourists can add/remove tours to their favorites
* View all saved tours

### 📅 **Booking System**

* Create booking
* Manage booking status (Admin/Guide)
* Dynamic pricing & group size rules

### 👤 **Profile System**

* User profile page
* Update name, email, picture
* Admin overview for all users

### 🛠️ **Admin Dashboard**

* Manage Users
* Block / Unblock
* View statistics
* Manage all tours & bookings

---

## 🏗️ Tech Stack


### **Backend**

* Node.js + Express.js
* Prisma ORM
* PostgreSQL
* Cloudinary for image upload
* JWT Auth (Access & Refresh Tokens)
* Role-based authorization middleware

---

## 🔧 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/arahman-webdev/local-guide-backend.git
cd etc
```

### 2️⃣ Install dependencies

#### Frontend



#### Backend

```bash
cd backend
npm install
```

### 3️⃣ Configure Environment Variables

Create a **.env** file in both frontend & backend.

Backend `.env` example:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/tourmate"
ACCESS_TOKEN_SECRET="your-secret"
REFRESH_TOKEN_SECRET="your-refresh-secret"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

Frontend `.env.local` example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4️⃣ Run Backend

```bash
cd backend
npx prisma migrate dev
npm run dev
```



---

## 📂 Project Structure





## 🧪 Testing

```bash
npm run or bun dev
```



---






## 👨‍💻 Developer

**Abdur Rahman**
Frontend Developer (MERN / Next.js)
📧 Email: [mdarahman5645@gmail.com](mailto:mdarahman5645@gmail.com)
GitHub: [https://github.com/arahman-webdev](https://github.com/arahman-webdev)


