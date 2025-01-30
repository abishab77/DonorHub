const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const express = require('express');

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

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    // Check if email already exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
            // Email already exists
            return res.status(409).json({ message: "Email already exists" });
        } else {
            // Email does not exist, proceed to generate and send OTP
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
                res.json({ message: "OTP sent successfully" });
            });
        }
    });
});

app.post('/send-otp1', (req, res) => {
    const { email } = req.body;

    // Validate email format
   

    // Check if email already exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

   
        else if (results.length > 0) {
            // Email does not exist, proceed to generate and send OTP
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
                res.json({ message: "OTP sent successfully" });
            });
        }
        else
        {
            return res.status(500).json({ message: "Email not exists" });
        }
    });
});// Endpoint to reset the password
app.post('/reset-password', (req, res) => {
    const {  password,email } = req.body;

  

    // Validate password (you can add more validation for password strength if needed)
    // if (password.length < 6) {
    //     return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    // }

    // Update the password in the database without hashing
    const query = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(query, [password, email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        // Check if the user exists
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Password updated successfully
        res.json({ message: 'Password updated successfully' });
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
    const { username, phone, email, password } = req.body;

    // if (!username ||  !phone || !email || !password) {
    //     return res.status(400).json({ message: 'All fields are required.' });
    // }

    const query = `INSERT INTO users (username,  phone, email, password) VALUES (?, ?, ?,  ?)`;
    db.query(query, [username, phone, email, password], (err, result) => {
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


//register receiptent
app.post('/register-receiptent', (req, res) => {
    console.log("Request Body:", req.body);

    const {
        name,
        dob,
        email,
        location,
        phone,
        emergency_phone,
        gender,
        donate,
        donate_before,
        volunteer
    } = req.body;
    console.log(email)
    const assistance_requested = Array.isArray(donate) ? donate.join(',') : donate;

    // First, retrieve the user_id from the users table using the email
    const getUserIdQuery = 'SELECT user_id FROM users WHERE email = ?';

    db.query(getUserIdQuery, [email], (err, result) => {
        if (err) {
            console.error('Error fetching user_id:', err);
            res.status(500).send('Error fetching user data.');
        } else if (result.length === 0) {
            res.status(404).send('User not found. Please register first.');
        } else {
            const user_id = result[0].user_id;

            // Insert data into the Recipients table
            const sql = `INSERT INTO Recipients 
                         (user_id, name, dob, email, location, phone, e_phone, gender, assistance, p_contact, identity_p) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                user_id,
                name,
                dob,
                email,
                location,
                phone,
                emergency_phone,
                gender,
                assistance_requested,
                donate_before,
                volunteer
            ];

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data into Recipients table:', err);
                    res.status(500).send('Error saving data to the database.');
                } else {
                    res.send('Form submitted successfully!');
                }
            });
        }
    });
});



//register donor
app.post('/register-donor', (req, res) => {
    console.log("Received data:", req.body); // Log incoming data

    const {
        name,
        email,
        location,
        phone,
        bloodGroup,
        gender,
        donationType,
        donateBefore,
        volunteer,

    } = req.body;

    console.log(email)
    // const assistance_requested = Array.isArray(donate) ? donate.join(',') : donate;

    // First, retrieve the user_id from the users table using the email
    const getUserIdQuery = 'SELECT user_id FROM users WHERE email = ?';

    db.query(getUserIdQuery, [email], (err, result) => {
        if (err) {
            console.error('Error fetching user_id:', err);
            res.status(500).send('Error fetching user data.');
        } else if (result.length === 0) {
            res.status(404).send('User not found. Please register first.');
        } else {
            const user_id = result[0].user_id;

            // Insert data into the donor table
            const sql = `INSERT INTO donors 
                                 (user_id, name, email, location, phone, blood_group, gender, donation_type, donated_before, volunteer) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const donationTypes = donationType ? donationType.join(", ") : null;
            const values = [
                user_id,
                name,
                email,
                location,
                phone,
                bloodGroup,
                gender,
                donationTypes,
                donateBefore,
                volunteer,

            ];


            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data into Recipients table:', err);
                    res.status(500).send('Error saving data to the database.');
                } else {
                    res.send('Form submitted successfully!');
                }
            });
        }
    });
});

//register volunteer
app.post('/register-volunteer', (req, res) => {
    console.log("Received data:", req.body); // Log incoming data
    const {
        name,
        dob,
        email,
        location,
        phone,
        gender,
        assist,
        coordinate,
        availability,
        experience
    } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    console.log(email)
    // const assistance_requested = Array.isArray(donate) ? donate.join(',') : donate;

    // First, retrieve the user_id from the users table using the email
    const getUserIdQuery = 'SELECT user_id FROM users WHERE email = ?';

    db.query(getUserIdQuery, [email], (err, result) => {
        if (err) {
            console.error('Error fetching user_id:', err);
            res.status(500).send('Error fetching user data.');
        } else if (result.length === 0) {
            res.status(404).send('User not found. Please register first.');
        } else {
            const user_id = result[0].user_id;

            // Insert data into the donor table
            const sql = `
            INSERT INTO volunteers (user_id,name, dob, email, location, phone, gender, assist, coordinate, availability, experience)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
            const assists = assist ? assist.join(", ") : null;
            const values = [
                user_id,
                name,
                dob,
                email,
                location,
                phone,

                gender,
                assists,
                coordinate,
                availability,
                experience,

            ];


            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data into volunteer table:', err);
                    res.status(500).send('Error saving data to the database.');
                } else {
                    res.send('Form submitted successfully!');
                }
            });
        }
    });
});
//register ngo
app.post('/register-ngo', (req, res) => {
    console.log("Received data:", req.body); // Log incoming data
    const {
        name,
        type,
        registration_number,
        role,
        email,
        location,
        phone,
        emergencyphone,
        assistance,
        ageGroup
    } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    console.log(email)
    // const assistance_requested = Array.isArray(donate) ? donate.join(',') : donate;

    // First, retrieve the user_id from the users table using the email
    const getUserIdQuery = 'SELECT user_id FROM users WHERE email = ?';

    db.query(getUserIdQuery, [email], (err, result) => {
        if (err) {
            console.error('Error fetching user_id:', err);
            res.status(500).send('Error fetching user data.');
        } else if (result.length === 0) {
            res.status(404).send('User not found. Please register first.');
        } else {
            const user_id = result[0].user_id;

            // Insert data into the donor table
            // Insert NGO data into the database
            const sql = `
           INSERT INTO ngos (
                user_id, registration_number, name, type, role, email, location, phone, e_phone, assistance, age_group
           ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       `;

            const ageGroupsString = Array.isArray(ageGroup) ? ageGroup.join(", ") : ageGroup || null;


            const values = [
                user_id,
                registration_number,
                name,
                type,
                role,
                email,
                location,
                phone,
                emergencyphone,
                assistance,
                ageGroupsString,

            ];



            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data into volunteer table:', err);
                    res.status(500).send('Error saving data to the database.');
                } else {
                    res.send('Form submitted successfully!');
                }
            });
        }
    });
});

// Endpoint to handle requests
// POST endpoint to send emails
app.post('/send-mail', async (req, res) => {
    try {
        const bloodGroup = req.body.bloodGroup;

        // Fetch emails of donors with the specified blood group
        const query = 'SELECT email FROM donors WHERE blood_group = ?';
        const [results] = await db.promise().query(query, [bloodGroup]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No donors found for this blood group.' });
        }

        const emails = results.map(row => row.email);

        // Email options
        const mailOptions = {
            from: 'donorhub2024@gmail.com',
            to: emails.join(','),
            subject: 'Blood Donation Request',
            text: `Dear donor, we urgently need B blood group donors. Please contact us if you can help. Thank you!`,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Emails sent: ${info.response}`);

        res.json({ message: `Emails sent successfully to ${emails.length} donor(s).` });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});





