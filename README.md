# Computer Science Department Portal

A full-stack student portal web application built for the **Internet & Web Technologies (IWT) Laboratory (MCA Program)**.

---

## 🌟 Key Features

- **Department Homepage (`index.html`)**: Features modern hero presentation, department highlights, curriculum features, and responsive layout.
- **Student Registration (`register.html`)**:
  - Full client-side validation (Name, Email format, 6+ character passwords with confirmation match, 10-digit phone, gender, department).
  - Secure backend storage with **bcrypt** password hashing into MySQL.
- **Student Login (`login.html`)**:
  - Validates credentials against MySQL using bcrypt.
  - Generates secure express-session cookies.
- **Protected Student Dashboard (`dashboard.html`)**:
  - Automatically verifies student session.
  - Redirects unauthenticated visitors to login.
  - Displays registered profile details (Name, Email, Department, Gender, Phone, Registration Date).
- **About Department (`about.html`)**:
  - Overview, Vision & Mission, Academic Programs (MCA, B.Tech, M.Tech, Ph.D.), Laboratory infrastructure, and Department contact details.
- **Session Logout**: Clears session and cookies securely.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla CSS with custom properties & responsive grid), Vanilla JavaScript (ES6+ `fetch` API).
- **Backend**: Node.js & Express.js.
- **Database**: MySQL (via XAMPP / MariaDB / standalone MySQL) with `mysql2` connection pooling.
- **Authentication**: `bcrypt` for one-way password hashing, `express-session` for session tracking.

---

## 📂 Project Structure

```
department_website/
├── .env                  # Database & session environment variables
├── .gitignore            # Git ignore list
├── database.sql          # MySQL database & users table creation script
├── db.js                 # MySQL connection pool configuration
├── package.json          # Node.js dependencies & scripts
├── README.md             # Project documentation
├── server.js             # Express API server & routes
└── public/               # Client-side static assets
    ├── about.html        # Department information page
    ├── dashboard.html    # Protected student profile dashboard
    ├── index.html        # Portal landing page
    ├── login.html        # Student login page
    ├── register.html     # Student registration page
    ├── css/
    │   └── style.css     # Unified CSS design system & responsive layout
    └── js/
        └── script.js     # Form validation, API calls, auth checks
```

---

## 🚀 Setup & Installation Instructions

### 1. Database Setup (XAMPP MySQL)

1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Open your browser and navigate to [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Click on the **SQL** tab.
4. Copy and paste the contents of `database.sql` and click **Go**:
   ```sql
   CREATE DATABASE IF NOT EXISTS department_db;
   USE department_db;

   CREATE TABLE IF NOT EXISTS users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL,
       department VARCHAR(100) NOT NULL,
       gender VARCHAR(20) NOT NULL,
       phone VARCHAR(20) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 2. Configure Environment (`.env`)

Verify the `.env` settings match your local MySQL configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=department_db
PORT=3000
SESSION_SECRET=department_secret_key
```

### 3. Install Dependencies & Start the Server

In PowerShell or your terminal inside the project directory:

```bash
# Install dependencies
npm install

# Start the Express server
npm start
```

### 4. Open in Browser

Navigate to:
- **Homepage**: [http://localhost:3000/](http://localhost:3000/)
- **Register**: [http://localhost:3000/register.html](http://localhost:3000/register.html)
- **Login**: [http://localhost:3000/login.html](http://localhost:3000/login.html)
- **Dashboard**: [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html)
- **About Us**: [http://localhost:3000/about.html](http://localhost:3000/about.html)

---

## 🧪 Verification & Testing Flow

1. Go to `register.html` and fill in all student details.
2. Observe validation alerts if any field is incorrect.
3. Submit a valid registration. You will receive a success message and be redirected to `login.html`.
4. Log in using the registered email and password.
5. You will be redirected to `dashboard.html` showing your registered name, department, phone, and joining date.
6. Attempt to open `dashboard.html` in an Incognito window — observe that it automatically redirects to `login.html` because no session is active.
7. Click **Logout** to terminate your session.
