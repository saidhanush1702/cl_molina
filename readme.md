# ERP Molina

A comprehensive **Enterprise Resource Planning (ERP)** system built
with:

-   ⚛️ React (Vite) -- Frontend\
-   🟢 Node.js + Express -- Backend\
-   🗄️ MySQL -- Database

------------------------------------------------------------------------

## 🚀 Prerequisites

Before starting, ensure the following are installed on your system:

-   **Node.js** (v18 or higher recommended)\
    https://nodejs.org/

-   **MySQL Server** (v8.0 or higher recommended)\
    https://dev.mysql.com/downloads/installer/

-   **MySQL Workbench** (Optional but recommended)

-   **Git**\
    https://git-scm.com/

------------------------------------------------------------------------

## 📂 Project Structure

tootls-Molina/ │ ├── backend/ → Node.js Express API, Controllers, Custom
Migration System ├── client/ → React (Vite) Frontend Application └──
README.md

------------------------------------------------------------------------

# 🛠️ Complete Setup Guide

------------------------------------------------------------------------

# 🗄️ MySQL Database Setup (Using MySQL Workbench)

## Step 1: Open MySQL Workbench

-   Open MySQL Workbench\
-   Connect to your local MySQL server (usually
    `Local instance MySQL80`)

------------------------------------------------------------------------

## Step 2: Create a New Database

1.  Go to Navigator → Schemas\
2.  Right click → Create Schema\
3.  Enter:

small_business_db

4.  Click Apply\
5.  Click Apply again\
6.  Click Finish

------------------------------------------------------------------------

## Step 3: Verify Database

Run this query inside Workbench:

SHOW DATABASES;

You should see:

small_business_db

------------------------------------------------------------------------

# ⚙️ Environment Configuration

Create a `.env` file in the root folder of the project and add:

DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=small_business_db
PORT=5000

### 🔎 Variable Explanation

  Variable   Value
  ---------- -----------------------------------------
  DB_HOST    localhost
  DB_USER    root (default)
  DB_PASS    Password you set while installing MySQL
  DB_NAME    small_business_db

⚠️ Do NOT push `.env` file to GitHub.\
Make sure `.env` is added in `.gitignore`.


------------------------------------------------------------------------

# 2️⃣ Backend Setup

## Step 1: Navigate to Backend

``` bash
cd backend
```

## Step 2: Install Dependencies

``` bash
npm install
```

## Step 3: Create `.env` File

Inside the `backend` folder, create a file named `.env` and add:

``` env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=

JWT_SECRET=supersecretkey

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

ENCRYPTION_KEY=my-super-secret-key-123456789012
```

## Step 4: Run Database Migrations & Seed Data

``` bash
node migrate.js
```

## Step 5: Start Backend Server

``` bash
npm run dev
# OR
node server.js
```

Backend will run at:

http://localhost:5000

------------------------------------------------------------------------

# 3️⃣ Frontend Setup

## Step 1: Open New Terminal & Navigate to Client

``` bash
cd client
```

## Step 2: Install Dependencies

``` bash
npm install
```

## Step 3: Create `.env` File

Inside the `client` folder, create `.env` and add:

``` env
VITE_BACKEND_URL=http://localhost:5000
```

## Step 4: Start Frontend

``` bash
npm run dev
```

Frontend will run at:

http://localhost:5173

------------------------------------------------------------------------

# 🔐 Default Login Credentials

Open:

http://localhost:5173

Login using:

Email: superadmin@system.com\
Password: admin123

------------------------------------------------------------------------

# ✅ Full Startup Summary

## Terminal 1 (Backend)

``` bash
cd backend
npm install
node migrate.js
npm run dev
```

## Terminal 2 (Frontend)

``` bash
cd client
npm install
npm run dev
```

------------------------------------------------------------------------

# 📌 Tech Stack

-   React + Vite
-   Node.js
-   Express.js
-   MySQL
-   JWT Authentication
-   Custom Migration System
-   SMTP Email Integration

------------------------------------------------------------------------

# 🏁 You're Ready!

Your ERP Molina system should now be fully running locally 🎉
