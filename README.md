
 DonorHub 🩸

**DonorHub** is a donation management platform designed to connect donors and recipients for **blood, food, and cloth donations**. It streamlines the donation process with real-time tracking, user management, and automatic email notifications.

---

## 🔧 Tech Stack

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Node.js, Express.js  
- **Database**: MySQL  
- **Email System**: NodeMailer  

---

## 🌟 Features

- ✅ User Registration & Login  
- ✅ Blood, Food, and Cloth Donation Forms  
- ✅ Donor Acceptance via Email  
- ✅ Recipient Notification with Donor Details  
- ✅ Admin Panel for User & Donation Requests Management  
- ✅ Community Module (Posts, Likes, Share)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/DonorHub.git
cd DonorHub
```

### 2. Install Dependencies

```bash
npm install
```



### 3. Run the Application

```bash
npm start
```

---

## 📦 Dependencies

This project uses the following Node.js packages:

- `express` – Web framework
- `body-parser` – Parses incoming request bodies
- `nodemailer` – Sends emails
- `multer` – Handles file uploads
- `cors` – Enables CORS for cross-origin requests

---

## 🗄️ Database Structure

The application uses a MySQL database named `donorhub`. Below are the primary tables involved in the system:

| Table Name         | Description                            |
|--------------------|----------------------------------------|
| `users`            | Stores login information for users     |
| `donors`           | Contains donor details                 |
| `recipients`       | Contains recipient details             |
| `blood_requests`   | Tracks blood donation requests         |
| `cloth_requests`   | Tracks cloth donation requests         |
| `food_requests`    | Tracks food donation requests          |
| `cloth_donates`    | Entries for cloth donations            |
| `food_donates`     | Entries for food donations             |
| `volunteers`       | Volunteer sign-up and data             |
| `ngos`             | NGO details and associations           |
| `messages`         | Internal message system or feedback    |

Make sure to import or create this schema in your MySQL server before running the application.

**Database Name**: `donorhub`

---

Thank You
Abinash S
