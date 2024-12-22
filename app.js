const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for OTPs (server-side)
const otpStorage = {};

// Configure Nodemailer for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'donorhub2024@gmail.com', // Replace with your Gmail address
        pass: 'fvzc kjyx vufg tirc',   // Replace with your Gmail app password
    },
});

// Endpoint to send OTP via Gmail
app.post('/send-otp', (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    otpStorage[email] = otp; // Store OTP for the email

    console.log(`OTP for ${email}: ${otp}`); // For debugging

    // Send OTP email
    const mailOptions = {
        from: 'donorhub2024@gmail.com',
        to: email,
        subject: 'Your OTP for Signup',
        text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        console.log(`OTP sent to ${email}: ${otp}`);
        res.json({ otp }); // Send OTP back to the client for storage
    });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    console.log(`Verifying OTP: Email - ${email}, OTP - ${otp}`);
    console.log(`Stored OTP for ${email}: ${otpStorage[email]}`);

    if (otpStorage[email] && otpStorage[email] == otp) {
        res.json({ message: 'OTP verified successfully!' });
        delete otpStorage[email]; // Clear OTP after successful verification
    } else {
        res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//db
const mysql = require('mysql2');


app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'donorhub'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Endpoint to handle form submission
app.post('/submit-form', (req, res) => {
    const { username, age, phone, email, password } = req.body;

    if (!username || !age || !phone || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const query = `INSERT INTO users (username, age, phone, email, password) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [username, age, phone, email, password], (err, result) => {
        if (err) {
            console.error('Error inserting data into database:', err);
            return res.status(500).json({ message: 'Database error.' });
        }
        res.status(200).json({ message: 'Form details saved successfully!' });
    });
});
//login
// Login Endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
  
    // Query to check if user exists with the provided email and password
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error.' });
      }
  
      if (results.length > 0) {
        // Success
        return res.status(200).json({ message: 'Login successful!' });
      } else {
        // Failure
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
    });
  });
  
