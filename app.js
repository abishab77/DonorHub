const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");
const express = require("express");
const session = require("express-session");

const app = express();
const PORT = 5501;

app.use(cors());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://127.0.0.1:5501"],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const otpStorage = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "", //email
    pass: "", //app password
  },
});

app.post("/send-otp", (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000);
      otpStorage[email] = otp;

      console.log(`OTP for ${email}: ${otp}`);

      const mailOptions = {
        from: "donorhub2024@gmail.com",
        to: email,
        subject: "Your OTP for Signup",
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

app.post("/send-otp1", (req, res) => {
  const { email } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    } else if (results.length > 0) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      otpStorage[email] = otp;

      console.log(`OTP for ${email}: ${otp}`);

      const mailOptions = {
        from: "donorhub2024@gmail.com",
        to: email,
        subject: "Your OTP for Signup",
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
    } else {
      return res.status(500).json({ message: "Email not exists" });
    }
  });
});
app.post("/reset-password", (req, res) => {
  const { password, email } = req.body;

  const query = "UPDATE users SET password = ? WHERE email = ?";
  db.query(query, [password, email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    res.json({ message: "Password updated successfully" });
  });
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  console.log(`Verifying OTP: Email - ${email}, OTP - ${otp}`);
  console.log(`Stored OTP for ${email}: ${otpStorage[email]}`);

  if (otpStorage[email] && otpStorage[email] == otp) {
    res.json({ message: "OTP verified successfully!" });
    delete otpStorage[email];
  } else {
    res.status(400).json({ message: "Invalid OTP. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const mysql = require("mysql2");

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "donorhub",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

app.post("/submit-form", (req, res) => {
  const { username, phone, email, password } = req.body;

  const query = `INSERT INTO users (username,  phone, email, password) VALUES (?, ?, ?,  ?)`;
  db.query(query, [username, phone, email, password], (err, result) => {
    if (err) {
      console.error("Error inserting data into database:", err);
      return res.status(500).json({ message: "Database error." });
    }
    res.status(200).json({ message: "Form details saved successfully!" });
  });
});

app.post("/register-receiptent", (req, res) => {
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
    volunteer,
  } = req.body;
  console.log(email);
  const assistance_requested = Array.isArray(donate)
    ? donate.join(",")
    : donate;

  const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";

  db.query(getUserIdQuery, [email], (err, result) => {
    if (err) {
      console.error("Error fetching user_id:", err);
      res.status(500).send("Error fetching user data.");
    } else if (result.length === 0) {
      res.status(404).send("User not found. Please register first.");
    } else {
      const user_id = result[0].user_id;

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
        volunteer,
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Error inserting data into Recipients table:", err);
          res.status(500).send("Error saving data to the database.");
        } else {
          res.send("Form submitted successfully!");
        }
      });
    }
  });
});

app.post("/register-donor", (req, res) => {
  console.log("Received data:", req.body);

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

  console.log(email);

  const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";

  db.query(getUserIdQuery, [email], (err, result) => {
    if (err) {
      console.error("Error fetching user_id:", err);
      res.status(500).send("Error fetching user data.");
    } else if (result.length === 0) {
      res.status(404).send("User not found. Please register first.");
    } else {
      const user_id = result[0].user_id;

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
          console.error("Error inserting data into Recipients table:", err);
          res.status(500).send("Error saving data to the database.");
        } else {
          res.send("Form submitted successfully!");
        }
      });
    }
  });
});

app.post("/register-volunteer", (req, res) => {
  console.log("Received data:", req.body);
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
    experience,
  } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  console.log(email);

  const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";

  db.query(getUserIdQuery, [email], (err, result) => {
    if (err) {
      console.error("Error fetching user_id:", err);
      res.status(500).send("Error fetching user data.");
    } else if (result.length === 0) {
      res.status(404).send("User not found. Please register first.");
    } else {
      const user_id = result[0].user_id;

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
          console.error("Error inserting data into volunteer table:", err);
          res.status(500).send("Error saving data to the database.");
        } else {
          res.send("Form submitted successfully!");
        }
      });
    }
  });
});
app.post("/register-ngo", (req, res) => {
  console.log("Received data:", req.body);
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
    ageGroup,
  } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  console.log(email);

  const getUserIdQuery = "SELECT user_id FROM users WHERE email = ?";

  db.query(getUserIdQuery, [email], (err, result) => {
    if (err) {
      console.error("Error fetching user_id:", err);
      res.status(500).send("Error fetching user data.");
    } else if (result.length === 0) {
      res.status(404).send("User not found. Please register first.");
    } else {
      const user_id = result[0].user_id;

      const sql = `
           INSERT INTO ngos (
                user_id, registration_number, name, type, role, email, location, phone, e_phone, assistance, age_group
           ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       `;

      const ageGroupsString = Array.isArray(ageGroup)
        ? ageGroup.join(", ")
        : ageGroup || null;

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
          console.error("Error inserting data into volunteer table:", err);
          res.status(500).send("Error saving data to the database.");
        } else {
          res.send("Form submitted successfully!");
        }
      });
    }
  });
});

app.post("/send-mail", async (req, res) => {
  try {
    const bloodGroup = req.body.bloodGroup;

    const query = "SELECT email FROM donors WHERE blood_group = ?";
    const [results] = await db.promise().query(query, [bloodGroup]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No donors found for this blood group." });
    }

    const emails = results.map((row) => row.email);

    const mailOptions = {
      from: "donorhub2024@gmail.com",
      to: emails.join(","),
      subject: "Blood Donation Request",
      text: `Dear donor, we urgently need B blood group donors. Please contact us if you can help. Thank you!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Emails sent: ${info.response}`);

    res.json({
      message: `Emails sent successfully to ${emails.length} donor(s).`,
    });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const config = {
  NGROK_URL: "http://localhost:5501",
};
app.post("/submit-blood-request", upload.single("photo"), (req, res) => {
  const {
    title,
    bloodGroup,
    patientName,
    patientAge,
    patientGender,
    medicalCondition,
    hospitalLocation,
    contactDetails,
    deadlineDate,
    deadlineTime,
    user_id,
  } = req.body;

  const patientPhoto = req.file ? req.file.buffer : null;

  if (
    !title ||
    !bloodGroup ||
    !patientName ||
    !patientAge ||
    !patientGender ||
    !medicalCondition ||
    !hospitalLocation ||
    !contactDetails ||
    !deadlineDate ||
    !deadlineTime ||
    !patientPhoto
  ) {
    return res.status(400).send("Missing required fields");
  }

  const getUserQuery = "SELECT username, email FROM users WHERE user_id = ?";
  db.query(getUserQuery, [user_id], (err, userResult) => {
    if (err || userResult.length === 0) {
      console.error("SQL Error (Fetching Username):", err);
      return res.status(500).send("Error fetching user data");
    }

    const username = userResult[0].username;
    const recipientEmail = userResult[0].email;

    const insertQuery = `INSERT INTO blood_requests 
            (title, blood_group, patient_name, patient_photo, patient_age, patient_gender, 
            medical_condition, hospital_location, contact_details, deadline_date, deadline_time, 
            status, verified, user_id, username) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      title,
      bloodGroup,
      patientName,
      patientPhoto,
      patientAge,
      patientGender,
      medicalCondition,
      hospitalLocation,
      contactDetails,
      deadlineDate,
      deadlineTime,
      "pending",
      "no",
      user_id,
      username,
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("SQL Error (Inserting Request):", err);
        return res.status(500).send("Error inserting data");
      }

      const requestId = result.insertId;

      const getEmailsQuery = "SELECT email FROM donors WHERE blood_group = ?";
      db.query(getEmailsQuery, [bloodGroup], (err, emailResults) => {
        if (err) {
          console.error("SQL Error (Fetching Donors' Emails):", err);
          return res.status(500).send("Error fetching donor emails");
        }

        if (emailResults.length > 0) {
          const emails = emailResults.map((row) => row.email);
          sendBloodRequestEmail(
            emails,
            requestId,
            title,
            bloodGroup,
            patientName,
            patientAge,
            patientGender,
            medicalCondition,
            hospitalLocation,
            contactDetails,
            deadlineDate,
            deadlineTime,
            user_id,
            username
          );
        }
      });

      const completeLink = `${config.NGROK_URL}/mark-completed/${requestId}`;
      const mailOptions = {
        from: "donorhub2024@gmail.com",
        to: recipientEmail,
        subject: "Please confirm your blood request status",
        html: `
                    <p>Hello ${username},</p>
                    <p>We hope your blood request titled <strong>${title}</strong> has been fulfilled.</p>
                    <p>If your request is completed, please click the button below to mark it as completed:</p>
                    <a href="${completeLink}" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none;">Mark as Completed</a>
                    <p>Thank you for using DonorHub!</p>
                `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Email Error (Completion):", err);
        } else {
          console.log("Completion mail sent:", info.response);
        }
      });

      res.send("Blood request submitted successfully!");
    });
  });
});

app.get("/mark-completed/:id", (req, res) => {
  const requestId = req.params.id;

  const updateQuery =
    "UPDATE blood_requests SET status = 'completed' WHERE id = ?";
  db.query(updateQuery, [requestId], (err, result) => {
    if (err) {
      console.error("SQL Error (Mark Completed):", err);
      return res.status(500).send("Error updating status");
    }

    res.send(
      "<h2>Thank you! Your blood request has been marked as <span style='color: green;'>completed</span>.</h2>"
    );
  });
});

function sendBloodRequestEmail(
  emails,
  requestId,
  title,
  bloodGroup,
  patientName,
  patientAge,
  patientGender,
  medicalCondition,
  hospitalLocation,
  contactDetails,
  deadlineDate,
  deadlineTime
) {
  emails.forEach((email) => {
    const getDonorIdQuery = "SELECT user_id FROM donors WHERE email = ?";
    db.query(getDonorIdQuery, [email], (err, donorResult) => {
      if (err || donorResult.length === 0) {
        console.error("❌ Error fetching donorId:", err);
        return;
      }

      const donorId = donorResult[0].user_id;
      const acceptLink = `${config.NGROK_URL}/accept-blood-request?requestId=${requestId}&donorId=${donorId}`;
      const denyLink = `${config.NGROK_URL}/deny-blood-request`;

      const mailOptions = {
        from: "donorhub2024@gmail.com",
        to: email,
        subject: "Urgent Blood Request - Your Help is Needed!",
        html: `
                    <p>Dear Donor,</p>
                    <p>A blood request has been posted, and your blood type matches.</p>
                    <p><strong>Patient Name:</strong> ${patientName}</p>
                    <p><strong>Blood Group:</strong> ${bloodGroup}</p>
                    <p><strong>Hospital Location:</strong> ${hospitalLocation}</p>
                    <p><strong>Contact:</strong> ${contactDetails}</p>
                    <p>
                        <a href="${acceptLink}" style="background:green;color:white;padding:10px 15px;text-decoration:none;">Accept</a>
                        &nbsp;&nbsp;
                        <a href="${denyLink}" style="background:red;color:white;padding:10px 15px;text-decoration:none;">Deny</a>
                    </p>
                `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending donor email:", error);
        } else {
          console.log(`✅ Email sent to donor (${email}):`, info.response);
        }
      });
    });
  });
}

app.get("/accept-blood-request", (req, res) => {
  const { requestId, donorId } = req.query;

  if (!requestId || !donorId) {
    return res.status(400).send("Invalid request. Missing parameters.");
  }

  const getRecipientQuery = `
        SELECT u.email AS recipientEmail 
        FROM blood_requests br
        JOIN users u ON br.user_id = u.user_id
        WHERE br.id = ?
    `;

  db.query(getRecipientQuery, [requestId], (err, result) => {
    if (err || result.length === 0) {
      console.error("❌ Error fetching recipient email:", err);
      return res.status(500).send("Error fetching recipient email");
    }

    const recipientEmail = result[0].recipientEmail;

    const getDonorQuery =
      "SELECT name, email, phone, blood_group FROM donors WHERE user_id = ?";
    db.query(getDonorQuery, [donorId], (err, donorResult) => {
      if (err || donorResult.length === 0) {
        console.error(
          "❌ Error fetching donor details:",
          err || "Donor not found"
        );
        return res.status(500).send("Error fetching donor details");
      }

      const donor = donorResult[0];

      sendDonorDetailsEmail(recipientEmail, donor, requestId);

      res.send(
        "✅ You have accepted the request. Recipient has been notified."
      );
    });
  });
});

app.get("/deny-blood-request", (req, res) => {
  res.send("You have denied the request. Thank you!");
});

function sendDonorDetailsEmail(recipientEmail, donorDetails, requestId) {
  const mailOptions = {
    from: "donorhub2024@gmail.com",
    to: recipientEmail,
    subject: "A Donor Has Accepted Your Blood Request!",
    html: `
            <p>Hello,</p>
            <p>Great news! A donor has accepted your blood request (ID: ${requestId}).</p>
            <h3>Donor Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${donorDetails.name}</li>
                <li><strong>Email:</strong> ${donorDetails.email}</li>
                <li><strong>Phone:</strong> ${donorDetails.phone}</li>
                <li><strong>Blood Group:</strong> ${donorDetails.blood_group}</li>
            </ul>
            <p>Please contact them as soon as possible.</p>
            <p>Regards,<br>DonorHub Team</p>
        `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("❌ Error sending donor info email:", err);
    } else {
      console.log("✅ Donor info email sent:", info.response);
    }
  });
}

app.post(
  "/submit-food-donate",
  upload.fields([{ name: "foodPhoto" }, { name: "personPhoto" }]),
  (req, res) => {
    const {
      title,
      foodType,
      foodQuantity,
      location,
      contactDetails,
      deliveryOptions,
      dietInfo,
      startTime,
      endTime,
      user_id,
    } = req.body;

    const foodPhoto = req.files["foodPhoto"]
      ? req.files["foodPhoto"][0].buffer
      : null;
    const personPhoto = req.files["personPhoto"]
      ? req.files["personPhoto"][0].buffer
      : null;

    if (
      !title ||
      !foodType ||
      !foodQuantity ||
      !location ||
      !contactDetails ||
      !deliveryOptions ||
      !dietInfo ||
      !startTime ||
      !endTime ||
      !foodPhoto ||
      !personPhoto
    ) {
      return res.status(400).send("Missing required fields");
    }

    const getUserQuery = "SELECT username FROM users WHERE user_id = ?";

    db.query(getUserQuery, [user_id], (err, userResult) => {
      if (err) {
        console.error("SQL Error (Fetching Username):", err);
        return res.status(500).send("Error fetching user data");
      }

      if (userResult.length === 0) {
        return res.status(404).send("User not found");
      }

      const username = userResult[0].username;

      const insertQuery = `INSERT INTO food_donates 
            (title, food_photo, food_type, food_quantity, person_photo, location, contact_details, 
            delivery_options, diet_info, start_time, end_time, status, verified, user_id, username) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        title,
        foodPhoto,
        foodType,
        foodQuantity,
        personPhoto,
        location,
        contactDetails,
        deliveryOptions,
        dietInfo,
        startTime,
        endTime,
        "pending",
        "no",
        user_id,
        username,
      ];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("SQL Error (Inserting Donation):", err);
          return res.status(500).send("Error saving data");
        }

        console.log("Fetching NGOs for food...");
        const ngoQuery = "SELECT email, name FROM ngos ";

        db.query(ngoQuery, (err, ngos) => {
          if (err) {
            console.error("SQL Error (Fetching NGOs):", err);
            return res.status(500).send("Error fetching NGOs");
          }

          console.log("NGOs found:", ngos.length);
          ngos.forEach((ngo) => {
            console.log(`Sending email to NGO: ${ngo.email}`);
            const mailOptions = {
              from: "donorhub2024@gmail.com",
              to: ngo.email,
              subject:
                "Food Available for Donation – Collect from Pickup Location",
              text: `Dear ${ngo.name},  
                    
                    We have food donations ready for collection, and we invite your organization to pick them up and distribute them to those in need. If your team can assist, please collect the food from the designated location.  
                    
                    Pickup Details:  
                    - Pickup Location: ${location}  
                    - Food Quantity: ${foodQuantity}  
                    - Time: Available until ${endTime}  
                    - Contact Person: ${contactDetails}  
                    
                    Your efforts in distributing this food will help those in need receive timely assistance. Please confirm your availability.  
                    
                    Thank you for your dedication to serving the community!  
                    
                    Best regards,  
                    The DonorHub Team  
                    donorhub2024@gmail.com`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error("Email Error (NGO):", err);
              } else {
                console.log(`NGO Email sent to ${ngo.email}: ${info.response}`);
              }
            });
          });
        });
        if (deliveryOptions === "recipient_pickup") {
          console.log("Fetching volunteers for food delivery...");
          Query = `
                  SELECT email, name 
FROM volunteers 
WHERE assist LIKE '%food%' 
AND (
    availability = 'Both' 
    OR (availability = '6AM-12PM' AND TIME(?) BETWEEN '06:00:00' AND '11:59:59') 
    OR (availability = '12PM-6PM' AND TIME(?) BETWEEN '12:00:00' AND '17:59:59')
);

                `;

          db.query(
            volunteerQuery,
            [startTime, startTime, startTime, startTime],
            (err, volunteers) => {
              if (err) {
                console.error("SQL Error (Fetching Volunteers):", err);
                return res.status(500).send("Error fetching volunteers");
              }

              console.log("Volunteers found:", volunteers.length);
              volunteers.forEach((volunteer) => {
                console.log(`Sending email to Volunteer: ${volunteer.email}`);
                const mailOptions = {
                  from: "donorhub2024@gmail.com",
                  to: volunteer.email,
                  subject: "Help Needed – Food Pickup & Delivery Request",
                  text: `Dear ${volunteer.name},  
                        
                        We need your support! Food donations are ready for pickup, and we’re looking for volunteers to help deliver them to those in need. If you're available, your help would be greatly appreciated.  
                        
                        Request Details:  
                        - Pickup Location: ${location}  
                        - Delivery Location: [Delivery Address]  
                        - Food Quantity: ${foodQuantity}  
                        - Time: ${startTime} - ${endTime}  
                        - Contact Person: ${contactDetails}  
                        
                        If you can assist, please confirm your availability. Your effort will help ensure this food reaches those who need it most.  
                        
                        Thank you for your kindness and support!  
                        
                        Best regards,  
                        The DonorHub Team  
                        donorhub2024@gmail.com`,
                };

                transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                    console.error("Email Error (Volunteer):", err);
                  } else {
                    console.log(
                      `Volunteer Email sent to ${volunteer.email}: ${info.response}`
                    );
                  }
                });
              });
            }
          );
        }

        res.send({
          message:
            "Food donation saved successfully, NGOs & volunteers notified",
          id: result.insertId,
        });
      });
    });
  }
);

app.post("/submit-cloth-donate", upload.single("clothPhoto"), (req, res) => {
  const {
    title,
    clothType,
    clothQuantity,
    clothCondition,
    clothSize,
    location,
    contactDetails,
    deliveryOptions,
    startTime,
    endTime,
    user_id,
  } = req.body;

  const clothPhoto = req.file ? req.file.buffer : null;

  if (
    !title ||
    !clothType ||
    !clothQuantity ||
    !clothCondition ||
    !clothSize ||
    !location ||
    !contactDetails ||
    !deliveryOptions ||
    !startTime ||
    !endTime ||
    !clothPhoto
  ) {
    return res.status(400).send("Missing required fields");
  }

  const getUserQuery = "SELECT username FROM users WHERE user_id = ?";

  db.query(getUserQuery, [user_id], (err, userResult) => {
    if (err) {
      console.error("SQL Error (Fetching Username):", err);
      return res.status(500).send("Error fetching user data");
    }

    if (userResult.length === 0) {
      return res.status(404).send("User not found");
    }

    const username = userResult[0].username;

    const insertQuery = `INSERT INTO cloth_donates 
            (title, cloth_photo, cloth_type, cloth_quantity, cloth_condition, cloth_size, 
            location, contact_details, delivery_options, start_time, end_time, status, verified, user_id, username) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      title,
      clothPhoto,
      clothType,
      clothQuantity,
      clothCondition,
      clothSize,
      location,
      contactDetails,
      deliveryOptions,
      startTime,
      endTime,
      "pending",
      "no",
      user_id,
      username,
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("SQL Error (Inserting Donation):", err);
        return res.status(500).send("Error saving data");
      }

      console.log("Fetching NGOs for cloth...");
      const ngoQuery = "SELECT email, name FROM ngos ";

      db.query(ngoQuery, (err, ngos) => {
        if (err) {
          console.error("SQL Error (Fetching NGOs):", err);
          return res.status(500).send("Error fetching NGOs");
        }

        console.log("NGOs found:", ngos.length);
        ngos.forEach((ngo) => {
          console.log(`Sending email to NGO: ${ngo.email}`);
          const mailOptions = {
            from: "donorhub2024@gmail.com",
            to: ngo.email,
            subject:
              "Clothing Available for Donation – Collect from Pickup Location",
            text: `Dear ${ngo.name},  
                    
                    We have clothing donations ready for collection, and we invite your organization to pick them up and distribute them to those in need. If your team can assist, please collect the clothes from the designated location.  
                    
                    Pickup Details:  
                    - Pickup Location: ${location}  
                    - Clothing Quantity: ${clothQuantity}  
                    - Time: Available until ${endTime}  
                    - Contact Person: ${contactDetails}  
                    
                    Your efforts in distributing these clothes will bring warmth and dignity to those in need. Please confirm your availability.  
                    
                    Thank you for your dedication to serving the community!  
                    
                    Best regards,  
                    The DonorHub Team  
                    donorhub2024@gmail.com`,
          };

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.error("Email Error (NGO):", err);
            } else {
              console.log(`NGO Email sent to ${ngo.email}: ${info.response}`);
            }
          });
        });
      });

      if (deliveryOptions === "recipient_pickup") {
        console.log("Fetching volunteers for cloth delivery...");
        const volunteerQuery = `
                    SELECT email, name 
FROM volunteers 
WHERE assist LIKE '%cloth%' 
AND (
    availability = 'Both' 
    OR (availability = '6AM-12PM' AND TIME(?) BETWEEN '06:00:00' AND '11:59:59') 
    OR (availability = '12PM-6PM' AND TIME(?) BETWEEN '12:00:00' AND '17:59:59')
);

                `;

        db.query(
          volunteerQuery,
          [startTime, startTime, startTime, startTime],
          (err, volunteers) => {
            if (err) {
              console.error("SQL Error (Fetching Volunteers):", err);
              return res.status(500).send("Error fetching volunteers");
            }

            console.log("Volunteers found:", volunteers.length);
            volunteers.forEach((volunteer) => {
              console.log(`Sending email to Volunteer: ${volunteer.email}`);
              const mailOptions = {
                from: "donorhub2024@gmail.com",
                to: ngo.email,
                subject:
                  "Clothing Available for Donation – Collect from Pickup Location",
                text: `Dear ${ngo.name},  
                        
                        We have clothing donations ready for collection, and we invite your organization to pick them up and distribute them to those in need. If your team can assist, please collect the clothes from the designated location.  
                        
                        Pickup Details:  
                        - Pickup Location: ${location}  
                        - Clothing Quantity: ${clothQuantity}  
                        - Time: Available until ${endTime}  
                        - Contact Person: ${contactDetails}  
                        
                        Your efforts in distributing these clothes will bring warmth and dignity to those in need. Please confirm your availability.  
                        
                        Thank you for your dedication to serving the community!  
                        
                        Best regards,  
                        The DonorHub Team  
                        donorhub2024@gmail.com`,
              };

              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  console.error("Email Error (Volunteer):", err);
                } else {
                  console.log(
                    `Volunteer Email sent to ${volunteer.email}: ${info.response}`
                  );
                }
              });
            });
          }
        );
      }

      res.send({
        message:
          "Cloth donation saved successfully, NGOs & volunteers notified",
        id: result.insertId,
      });
    });
  });
});

app.post("/submit-cloth-request", (req, res) => {
  const {
    title,
    recipientCount,
    ageGroup,
    recipientGender,
    location,
    contactDetails,
    needReason,
    deliveryOptions,
    deadlineDate,
    deadlineTime,
    user_id,
  } = req.body;

  if (
    !title ||
    !recipientCount ||
    !ageGroup ||
    !recipientGender ||
    !location ||
    !contactDetails ||
    !needReason ||
    !deliveryOptions ||
    !deadlineDate ||
    !deadlineTime
  ) {
    return res.status(400).send("Missing required fields");
  }

  const getUserQuery = "SELECT username FROM users WHERE user_id = ?";

  db.query(getUserQuery, [user_id], (err, userResult) => {
    if (err) {
      console.error("SQL Error (Fetching Username):", err);
      return res.status(500).send("Error fetching user data");
    }

    if (userResult.length === 0) {
      return res.status(404).send("User not found");
    }

    const username = userResult[0].username;

    const insertQuery = `INSERT INTO cloth_requests 
            (title, recipient_count, age_group, recipient_gender, location, contact_details, 
            need_reason, delivery_options, deadline_date, deadline_time, status, verified, user_id, username) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      title,
      recipientCount,
      ageGroup,
      recipientGender,
      location,
      contactDetails,
      needReason,
      deliveryOptions,
      deadlineDate,
      deadlineTime,
      "pending",
      "no",
      user_id,
      username,
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("SQL Error (Inserting Request):", err);
        return res.status(500).send("Error saving data");
      }

      if (deliveryOptions === "recipient_pickup") {
        console.log("Fetching volunteers...");

        const volunteerQuery = `
                    SELECT email, name 
                    FROM volunteers 
                    WHERE assist LIKE '%cloth%' 
                    AND (
                        availability = 'Both' 
                        OR (availability = '6AM-12PM' AND TIME(?) >= '06:00:00' AND TIME(?) < '12:00:00') 
                        OR (availability = '12PM-6PM' AND TIME(?) >= '12:00:00' AND TIME(?) < '18:00:00')
                    );
                `;
      }

      console.log("Fetching donors...");

      const donorQuery =
        "SELECT email, name FROM donors WHERE donation_type LIKE '%cloth%'";

      db.query(donorQuery, (err, donors) => {
        if (err) {
          console.error("SQL Error (Fetching Donors):", err);
          return res.status(500).send("Error fetching donors");
        }

        console.log("Donors found:", donors.length);
        if (donors.length === 0) return;

        donors.forEach((donor) => {
          console.log(`Sending email to donor: ${donor.email}`);

          const mailOptions = {
            from: "donorhub2024@gmail.com",
            to: donor.email,
            subject: "Urgent Clothing Donation Needed – Can You Help?",
            text: `Dear ${donor.name},  
                    
                    We are reaching out to request clothing donations for those in need. If you are willing to contribute, your generosity can provide warmth and dignity to someone today.  
                    
                    Request Details:  
                    - Clothes Needed: ${recipientCount} people  
                    - Gender: ${recipientGender}  
                    - Delivery Location: ${location}  
                    - Time: Required by ${deadlineDate} ${deadlineTime}  
                    - Contact Person: ${contactDetails}  
                    
                    If you can donate, please confirm your availability. Your kindness can bring comfort to those who need it most.  
                    
                    Thank you for making a difference!  
                    
                    Best regards,  
                    The DonorHub Team  
                    donorhub2024@gmail.com`,
          };

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.error("Email Error (Donor):", err);
            } else {
              console.log(
                `Donor Email sent to ${donor.email}: ${info.response}`
              );
            }
          });
        });
      });
      console.log("Fetching NGOs...");
      const ngoQuery = "SELECT email, name FROM ngos ";

      db.query(ngoQuery, (err, ngos) => {
        if (err) {
          console.error("SQL Error (Fetching NGOs):", err);
          return res.status(500).send("Error fetching NGOs");
        }

        console.log("NGOs found:", ngos.length);
        if (ngos.length === 0) return;

        ngos.forEach((ngo) => {
          console.log(`Sending email to NGO: ${ngo.email}`);
          const mailOptions = {
            from: "donorhub2024@gmail.com",
            to: ngo.email,
            subject: "Urgent Clothing Assistance Needed – Can You Help?",
            text: `Dear ${ngo.name},  
        
        We are reaching out to request clothing donations for individuals in need. If your organization is willing to contribute, your support can bring warmth and dignity to many.  
        
        Request Details:  
        - Clothes Needed: ${recipientCount} people  
        - Gender: ${recipientGender}  
        - Delivery Location: ${location}  
        - Time: Required by ${deadlineDate} ${deadlineTime}  
        - Contact Person: ${contactDetails}  
        
        If your organization can donate, please confirm your availability. Your generosity can make a meaningful impact.  
        
        Thank you for your continued support in helping those in need!  
        
        Best regards,  
        The DonorHub Team  
        donorhub2024@gmail.com`,
          };

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.error("Email Error (NGO):", err);
            } else {
              console.log(`NGO Email sent to ${ngo.email}: ${info.response}`);
            }
          });
        });
      });

      res.send({
        message: "Cloth request submitted, volunteers & donors notified",
        id: result.insertId,
      });
    });
  });
});

app.post("/submit-food-request", (req, res) => {
  const {
    title,
    foodType,
    numPeopleNeeded,
    deliveryOptions,
    location,
    contactDetails,
    deadlineDate,
    deadlineTime,
    user_id,
  } = req.body;

  if (
    !title ||
    !foodType ||
    !numPeopleNeeded ||
    !deliveryOptions ||
    !location ||
    !contactDetails ||
    !deadlineDate ||
    !deadlineTime
  ) {
    return res.status(400).send("Missing required fields");
  }

  const getUserQuery = "SELECT username FROM users WHERE user_id = ?";

  db.query(getUserQuery, [user_id], (err, userResult) => {
    if (err) {
      console.error("SQL Error (Fetching Username):", err);
      return res.status(500).send("Error fetching user data");
    }

    if (userResult.length === 0) {
      return res.status(404).send("User not found");
    }

    const username = userResult[0].username;

    const insertQuery = `INSERT INTO food_requests 
            (title, food_type, num_people_needed, delivery_options, location, 
            contact_details, deadline_date, deadline_time, user_id, username) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      title,
      foodType,
      numPeopleNeeded,
      deliveryOptions,
      location,
      contactDetails,
      deadlineDate,
      deadlineTime,
      user_id,
      username,
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("SQL Error (Inserting Request):", err);
        return res.status(500).send("Error saving data");
      }

      const donorQuery = `SELECT email, name FROM donors WHERE donation_type LIKE '%food%'`;

      db.query(donorQuery, (err, donors) => {
        if (err) {
          console.error("SQL Error (Fetching Donors):", err);
          return res.status(500).send("Error fetching donors");
        }

        if (donors.length > 0) {
          donors.forEach((donor) => {
            const mailOptions = {
              from: "donorhub2024@gmail.com",
              to: donor.email,
              subject: "Help Needed – Food Donation Request",
              text: `Dear ${donor.name},  
                        
                        There is an urgent need for food, and your support can make a difference! If you're willing to donate, please find the details below:  
                        
                        Request Details:  
                        - Food Needed: ${foodType}  
                        - Food Quantity: ${numPeopleNeeded} people  
                        - Delivery Location: ${location}  
                        - Time: Required by ${deadlineDate} ${deadlineTime}  
                        - Contact Person: ${contactDetails}  
                        
                        Your generosity can help feed those in need. If you’re able to contribute, please confirm your donation.  
                        
                        Thank you for being a part of DonorHub and making an impact!  
                        
                        Best regards,  
                        The DonorHub Team  
                        donorhub2024@gmail.com`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error("Email Error (Donors):", err);
              } else {
                console.log(
                  `Email sent to donor ${donor.email}: ${info.response}`
                );
              }
            });
          });
        }

        if (deliveryOptions.toLowerCase() === "recipient_pickup") {
          const volunteerQuery = `
                        SELECT email, name 
                        FROM volunteers 
                        WHERE assist LIKE '%food%' 
                        AND (
                            availability = 'Both' 
                            OR (availability = '6AM-12PM' AND TIME(?) >= '06:00:00' AND TIME(?) < '12:00:00') 
                            OR (availability = '12PM-6PM' AND TIME(?) >= '12:00:00' AND TIME(?) < '18:00:00')
                        );
                    `;

          db.query(
            volunteerQuery,
            [deadlineTime, deadlineTime, deadlineTime, deadlineTime],
            (err, volunteers) => {
              if (err) {
                console.error("SQL Error (Fetching Volunteers):", err);
                return res.status(500).send("Error fetching volunteers");
              }

              if (volunteers.length > 0) {
                volunteers.forEach((volunteer) => {
                  const mailOptions = {
                    from: "donorhub2024@gmail.com",
                    to: volunteer.email,
                    subject: "Urgent: Food Donation Assistance Needed",
                    text: `Hello ${volunteer.name},\n\nA food request has been submitted:\n\n- Title: ${title}\n- Location: ${location}\n- Contact: ${contactDetails}\n- Deadline: ${deadlineDate} ${deadlineTime}\n\nYour assistance would be greatly appreciated.\n\nBest regards,\nDonorHub Team`,
                  };
                });
              }
              console.log("Fetching NGOs for food...");
              const ngoQuery = "SELECT email, name FROM ngos ";

              db.query(ngoQuery, (err, ngos) => {
                if (err) {
                  console.error("SQL Error (Fetching NGOs):", err);
                  return res.status(500).send("Error fetching NGOs");
                }

                console.log("NGOs found:", ngos.length);
                if (ngos.length === 0) return;

                ngos.forEach((ngo) => {
                  console.log(`Sending email to NGO: ${ngo.email}`);

                  const mailOptions = {
                    from: "donorhub2024@gmail.com",
                    to: ngo.email,
                    subject: "Urgent Food Assistance Needed – Can You Help?",
                    text: `Dear ${ngo.name},  
        
        We are reaching out to seek your support in providing food for those in need. If your organization is willing to donate, your generosity can make a real difference.  
        
        Request Details:  
        - Food Needed: ${foodType}  
        - Food Quantity: ${numPeopleNeeded} people  
        - Delivery Location: ${location}  
        - Time: Required by ${deadlineDate} ${deadlineTime}  
        - Contact Person: ${contactDetails}  
        
        If you can contribute, please let us know at the earliest. Your help ensures that those in need receive timely assistance.  
        
        Thank you for your compassion and support!  
        
        Best regards,  
        The DonorHub Team  
        donorhub2024@gmail.com`,
                  };

                  transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                      console.error("Email Error (NGO):", err);
                    } else {
                      console.log(
                        `NGO Email sent to ${ngo.email}: ${info.response}`
                      );
                    }
                  });
                });
              });

              res.send({
                message:
                  "Food request submitted. Donors and volunteers,ngo notified.",
                id: result.insertId,
              });
            }
          );
        } else {
          res.send({
            message: "Food request submitted. Donors notified.",
            id: result.insertId,
          });
        }
      });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const query = "SELECT user_id FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length > 0) {
      const user_id = results[0].user_id;
      return res.status(200).json({ message: "Login successful!", user_id });
    } else {
      return res.status(401).json({ message: "Invalid email or password." });
    }
  });
});

app.use(express.static(__dirname));

app.get("/api/posts/get-posts-blood", (req, res) => {
  const query = "SELECT * FROM blood_requests ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }

    const formattedResults = results.map((post) => ({
      ...post,
      patient_photo: post.patient_photo
        ? Buffer.from(post.patient_photo).toString("base64")
        : null,
    }));

    res.json(formattedResults);
  });
});

app.get("/api/posts/get-posts-foodrequests", (req, res) => {
  const query = "SELECT * FROM food_requests ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }

    res.json(results);
  });
});
app.get("/api/posts/get-posts-clothrequests", (req, res) => {
  const query = "SELECT * FROM cloth_requests ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }

    res.json(results);
  });
});

app.use(express.static(__dirname));

app.get("/api/posts/get-posts-fooddonates", (req, res) => {
  const query = "SELECT * FROM food_donates ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }

    const formattedResults = results.map((post) => ({
      ...post,
      person_photo: post.person_photo
        ? Buffer.from(post.person_photo).toString("base64")
        : null,
    }));

    res.json(formattedResults);
  });
});
app.use(express.static(__dirname));

app.get("/api/posts/get-posts-clothdonates", (req, res) => {
  const query = "SELECT * FROM cloth_donates ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }

    const formattedResults = results.map((post) => ({
      ...post,
      cloth_photo: post.cloth_photo
        ? Buffer.from(post.cloth_photo).toString("base64")
        : null,
    }));

    res.json(formattedResults);
  });
});

app.get("/api/posts/get-all-posts", (req, res) => {
  const query = `
    SELECT 
    id, 
    title, 
    'blood_requests' AS source, 
    blood_group AS type, 
    patient_name AS name, 
    NULL AS food_type, 
    NULL AS cloth_type, 
    patient_photo AS photo, 
    NULL AS cloth_photo, 
    NULL AS food_photo, 
    NULL AS person_photo, 
    patient_age AS age, 
    patient_gender AS gender, 
    hospital_location AS location, 
    contact_details, 
    deadline_date, 
    deadline_time, 
    medical_condition,  -- Added missing column
    NULL AS num_people_needed, 
    NULL AS delivery_options, 
    NULL AS age_group, 
    NULL AS need_reason, 
    NULL AS diet_info, 
    NULL AS start_time, 
    NULL AS end_time, 
    NULL AS cloth_quantity, 
    NULL AS cloth_condition, 
    NULL AS cloth_size, 
      NULL as food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    username
FROM blood_requests

UNION ALL

SELECT 
    id, 
    title, 
    'food_requests' AS source, 
    NULL AS type, 
    NULL AS name, 
    food_type, 
    NULL AS cloth_type, 
    NULL AS photo, 
    NULL AS cloth_photo, 
    NULL AS food_photo, 
    NULL AS person_photo, 
    NULL AS age, 
    NULL AS gender, 
    location, 
    contact_details, 
    deadline_date, 
    deadline_time, 
    NULL AS medical_condition, 
    num_people_needed,  -- Added missing column
    delivery_options,  -- Added missing column
    NULL AS age_group, 
    NULL AS need_reason, 
    NULL AS diet_info, 
    NULL AS start_time, 
    NULL AS end_time, 
    NULL AS cloth_quantity, 
    NULL AS cloth_condition, 
    NULL AS cloth_size, 
      NULL as food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    username
FROM food_requests

UNION ALL

SELECT 
    id, 
    title, 
    'cloth_requests' AS source, 
    NULL AS type, 
    NULL AS name, 
    NULL AS food_type, 
    NULL AS cloth_type, 
    NULL AS photo, 
    NULL AS cloth_photo, 
    NULL AS food_photo, 
    NULL AS person_photo, 
    recipient_count AS age, 
    recipient_gender AS gender, 
    location, 
    contact_details, 
    deadline_date, 
    deadline_time, 
    NULL AS medical_condition, 
    NULL AS num_people_needed, 
    delivery_options, 
    age_group,  -- Added missing column
    need_reason,  -- Added missing column
    NULL AS diet_info, 
    NULL AS start_time, 
    NULL AS end_time, 
    NULL AS cloth_quantity, 
    NULL AS cloth_condition, 
    NULL AS cloth_size, 
    NULL as food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    username
FROM cloth_requests

UNION ALL

SELECT 
    id, 
    title, 
    'food_donates' AS source, 
    NULL AS type, 
    NULL AS name, 
    food_type, 
    NULL AS cloth_type, 
    NULL AS photo, 
    NULL AS cloth_photo, 
    food_photo, 
    person_photo, 
    NULL AS age, 
    NULL AS gender, 
    location, 
    contact_details, 
    NULL AS deadline_date, 
    NULL AS deadline_time, 
    NULL AS medical_condition, 
    NULL AS num_people_needed, 
    delivery_options,  -- Added missing column
    NULL AS age_group, 
    NULL AS need_reason, 
    diet_info,  -- Added missing column
    start_time,  -- Added missing column
    end_time,  -- Added missing column
    NULL AS cloth_quantity, 
    NULL AS cloth_condition, 
    NULL AS cloth_size, 
    food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    (SELECT username FROM users WHERE users.user_id = food_donates.user_id) AS username
FROM food_donates

UNION ALL

SELECT 
    id, 
    title, 
    'cloth_donates' AS source, 
    NULL AS type, 
    NULL AS name, 
    NULL AS food_type, 
    cloth_type, 
    NULL AS photo, 
    cloth_photo, 
    NULL AS food_photo, 
    NULL AS person_photo, 
    NULL AS age, 
    NULL AS gender, 
    location, 
    contact_details, 
    NULL AS deadline_date, 
    NULL AS deadline_time, 
    NULL AS medical_condition, 
    NULL AS num_people_needed, 
    delivery_options,  -- Added missing column
    NULL AS age_group, 
    NULL AS need_reason, 
    NULL AS diet_info, 
    start_time,  -- Added missing column
    end_time,  -- Added missing column
    cloth_quantity,  -- Added missing column
    cloth_condition,  -- Added missing column
    cloth_size,  -- Added missing column
      NULL as food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    username
FROM cloth_donates

ORDER BY created_at DESC;
 `;

  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database query failed", details: err });
    }

    const formattedResults = results.map((post) => ({
      ...post,
      photo: post.photo ? Buffer.from(post.photo).toString("base64") : null,
      cloth_photo: post.cloth_photo
        ? Buffer.from(post.cloth_photo).toString("base64")
        : null,
      food_photo: post.food_photo
        ? Buffer.from(post.food_photo).toString("base64")
        : null,
      person_photo: post.person_photo
        ? Buffer.from(post.person_photo).toString("base64")
        : null,
    }));

    res.json(formattedResults);
  });
});

app.get("/api/donor-count", (req, res) => {
  db.query("SELECT COUNT(*) AS count FROM donors", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: results[0].count });
  });
});
app.get("/api/total-donations", (req, res) => {
  const query = `
        SELECT 
            (SELECT COUNT(*) FROM blood_requests) +
            (SELECT COUNT(*) FROM food_requests) +
            (SELECT COUNT(*) FROM cloth_requests) +
            (SELECT COUNT(*) FROM food_donates) +
            (SELECT COUNT(*) FROM cloth_donates) AS total_count
    `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ count: results[0].total_count });
  });
});

app.post("/getUserDetails", (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is missing" });
  }

  const userDetailsQuery = `
        SELECT 
            u.username AS name,
            u.email,
            (SELECT COUNT(*) FROM donors WHERE user_id = ?) AS is_donor,
            (SELECT COUNT(*) FROM volunteers WHERE user_id = ?) AS is_volunteer,
            (SELECT COUNT(*) FROM ngos WHERE user_id = ?) AS is_ngo,
            (SELECT blood_group FROM donors WHERE user_id = ? LIMIT 1) AS blood_group,
            COALESCE(
                (SELECT location FROM donors WHERE user_id = ? LIMIT 1),
                (SELECT location FROM volunteers WHERE user_id = ? LIMIT 1),
                (SELECT location FROM ngos WHERE user_id = ? LIMIT 1)
            ) AS location
        FROM users u
        WHERE u.user_id = ?;
    `;

  db.query(
    userDetailsQuery,
    [user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let roles = [];
      if (result[0].is_donor) roles.push("Donor");
      if (result[0].is_volunteer) roles.push("Volunteer");
      if (result[0].is_ngo) roles.push("NGO");

      res.json({
        success: true,
        name: result[0].name,
        email: result[0].email,
        role: roles.length > 0 ? roles.join(", ") : "Unknown",
        blood_group: result[0].blood_group || null,
        location: result[0].location || "Not Available",
      });
    }
  );
});

app.get("/api/posts/get-user-posts", (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const query = `
    SELECT 
    id, 
    title, 
    'blood_requests' AS source, 
    blood_group AS type, 
    patient_name AS name, 
    NULL AS food_type, 
    NULL AS cloth_type, 
    patient_photo AS photo, 
    NULL AS cloth_photo, 
    NULL AS food_photo, 
    NULL AS person_photo, 
    patient_age AS age, 
    patient_gender AS gender, 
    hospital_location AS location, 
    contact_details, 
    deadline_date, 
    deadline_time, 
    medical_condition,  -- Added missing column
    NULL AS num_people_needed, 
    NULL AS delivery_options, 
    NULL AS age_group, 
    NULL AS need_reason, 
    NULL AS diet_info, 
    NULL AS start_time, 
    NULL AS end_time, 
    NULL AS cloth_quantity, 
    NULL AS cloth_condition, 
    NULL AS cloth_size, 
      NULL as food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    username
FROM blood_requests WHERE user_id = ?

UNION ALL

SELECT 
    id, 
    title, 
    'food_requests' AS source, 
    NULL AS type, 
    NULL AS name, 
    food_type, 
    NULL AS cloth_type, 
    NULL AS photo, 
    NULL AS cloth_photo, 
    NULL AS food_photo, 
    NULL AS person_photo, 
    NULL AS age, 
    NULL AS gender, 
    location, 
    contact_details, 
    deadline_date, 
    deadline_time, 
    NULL AS medical_condition, 
    num_people_needed,  -- Added missing column
    delivery_options,  -- Added missing column
    NULL AS age_group, 
    NULL AS need_reason, 
    NULL AS diet_info, 
    NULL AS start_time, 
    NULL AS end_time, 
    NULL AS cloth_quantity, 
    NULL AS cloth_condition, 
    NULL AS cloth_size, 
      NULL as food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    username
FROM food_requests WHERE user_id = ?

UNION ALL

SELECT 
    id, 
    title, 
    'cloth_requests' AS source, 
    NULL AS type, 
    NULL AS name, 
    NULL AS food_type, 
    NULL AS cloth_type, 
    NULL AS photo, 
    NULL AS cloth_photo, 
    NULL AS food_photo, 
    NULL AS person_photo, 
    recipient_count AS age, 
    recipient_gender AS gender, 
    location, 
    contact_details, 
    deadline_date, 
    deadline_time, 
    NULL AS medical_condition, 
    NULL AS num_people_needed, 
    NULL AS delivery_options, 
    age_group,  -- Added missing column
    need_reason,  -- Added missing column
    NULL AS diet_info, 
    NULL AS start_time, 
    NULL AS end_time, 
    NULL AS cloth_quantity, 
    NULL AS cloth_condition, 
    NULL AS cloth_size, 
    NULL as food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    username
FROM cloth_requests WHERE user_id = ?

UNION ALL

SELECT 
    id, 
    title, 
    'food_donates' AS source, 
    NULL AS type, 
    NULL AS name, 
    food_type, 
    NULL AS cloth_type, 
    NULL AS photo, 
    NULL AS cloth_photo, 
    food_photo, 
    person_photo, 
    NULL AS age, 
    NULL AS gender, 
    location, 
    contact_details, 
    NULL AS deadline_date, 
    NULL AS deadline_time, 
    NULL AS medical_condition, 
    NULL AS num_people_needed, 
    delivery_options,  -- Added missing column
    NULL AS age_group, 
    NULL AS need_reason, 
    diet_info,  -- Added missing column
    start_time,  -- Added missing column
    end_time,  -- Added missing column
    NULL AS cloth_quantity, 
    NULL AS cloth_condition, 
    NULL AS cloth_size, 
    food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    (SELECT username FROM users WHERE users.user_id = food_donates.user_id) AS username
FROM food_donates WHERE user_id = ?

UNION ALL

SELECT 
    id, 
    title, 
    'cloth_donates' AS source, 
    NULL AS type, 
    NULL AS name, 
    NULL AS food_type, 
    cloth_type, 
    NULL AS photo, 
    cloth_photo, 
    NULL AS food_photo, 
    NULL AS person_photo, 
    NULL AS age, 
    NULL AS gender, 
    location, 
    contact_details, 
    NULL AS deadline_date, 
    NULL AS deadline_time, 
    NULL AS medical_condition, 
    NULL AS num_people_needed, 
    delivery_options,  -- Added missing column
    NULL AS age_group, 
    NULL AS need_reason, 
    NULL AS diet_info, 
    start_time,  -- Added missing column
    end_time,  -- Added missing column
    cloth_quantity,  -- Added missing column
    cloth_condition,  -- Added missing column
    cloth_size,  -- Added missing column
      NULL as food_quantity ,
    status, 
    verified, 
    user_id, 
    created_at, 
    username
FROM cloth_donates WHERE user_id = ?

ORDER BY created_at DESC;
 `;

  db.query(query, [userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database query failed", details: err });
    }

    const formattedResults = results.map((post) => ({
      ...post,
      photo: post.photo ? Buffer.from(post.photo).toString("base64") : null,
      cloth_photo: post.cloth_photo
        ? Buffer.from(post.cloth_photo).toString("base64")
        : null,
      food_photo: post.food_photo
        ? Buffer.from(post.food_photo).toString("base64")
        : null,
      person_photo: post.person_photo
        ? Buffer.from(post.person_photo).toString("base64")
        : null,
    }));

    res.json(formattedResults);
  });
});

app.get("/users", async (req, res) => {
  try {
    const usersQuery = `SELECT user_id, username, email,phone, status FROM users`;
    db.query(usersQuery, async (err, users) => {
      if (err) {
        console.error("❌ Database Query Error:", err);
        res.status(500).json({ error: "Database query failed" });
        return;
      }

      console.log("✅ Users fetched:", users);

      if (!Array.isArray(users)) {
        console.error("❌ Invalid user data format:", users);
        res.status(500).json({ error: "Invalid data format" });
        return;
      }

      for (let user of users) {
        const [isDonor, isVolunteer, isNGO, isRecipient] = await Promise.all([
          checkUserRole(user.user_id, "donors"),
          checkUserRole(user.user_id, "volunteers"),
          checkUserRole(user.user_id, "ngos"),
          checkUserRole(user.user_id, "recipients"),
        ]);

        if (isDonor && isVolunteer && isNGO && isRecipient) {
          user.role = "Donor, Volunteer, NGO, Recipient";
        } else if (isDonor && isVolunteer && isNGO) {
          user.role = "Donor, Volunteer, NGO";
        } else if (isDonor && isVolunteer && isRecipient) {
          user.role = "Donor, Volunteer, Recipient";
        } else if (isDonor && isNGO && isRecipient) {
          user.role = "Donor, NGO, Recipient";
        } else if (isVolunteer && isNGO && isRecipient) {
          user.role = "Volunteer, NGO, Recipient";
        } else if (isDonor && isVolunteer) {
          user.role = "Donor, Volunteer";
        } else if (isDonor && isNGO) {
          user.role = "Donor, NGO";
        } else if (isDonor && isRecipient) {
          user.role = "Donor, Recipient";
        } else if (isVolunteer && isNGO) {
          user.role = "Volunteer, NGO";
        } else if (isVolunteer && isRecipient) {
          user.role = "Volunteer, Recipient";
        } else if (isNGO && isRecipient) {
          user.role = "NGO, Recipient";
        } else if (isDonor) {
          user.role = "Donor";
        } else if (isVolunteer) {
          user.role = "Volunteer";
        } else if (isNGO) {
          user.role = "NGO";
        } else if (isRecipient) {
          user.role = "Recipient";
        } else {
          user.role = "User";
        }
      }

      console.log("✅ Final user list with roles:", users);
      res.json(users);
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const checkUserRole = (userId, tableName) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(*) as count FROM ${tableName} WHERE user_id = ?`,
      [userId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0].count > 0);
      }
    );
  });
};

app.put("/users/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    `UPDATE users SET status = ? WHERE user_id = ?`,
    [status, id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "✅ User status updated successfully" });
    }
  );
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  db.query(`DELETE FROM users WHERE user_id = ?`, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "✅ User deleted successfully" });
  });
});

app.get("/posts", (req, res) => {
  const sql = `
        SELECT id,user_id, title, username AS author, status, verified, 'Blood Donation' AS category FROM blood_requests
        UNION ALL
        SELECT id,user_id, title, username, status, verified, 'Food Assistance' FROM food_requests
        UNION ALL
        SELECT id,user_id, title, username, status, verified, 'Clothes' FROM cloth_requests
        UNION ALL
        SELECT id,user_id, title, username, status, verified, 'Food Donation' FROM food_donates
        UNION ALL
        SELECT id,user_id, title, username, status, verified, 'Cloth Donation' FROM cloth_donates;
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.put("/update-poststatus", (req, res) => {
  const { postId, newStatus, tableName } = req.body;

  if (!postId || !newStatus || !tableName) {
    return res
      .status(400)
      .json({ error: "Post ID, status, and table name are required" });
  }

  const validTables = [
    "blood_requests",
    "food_requests",
    "cloth_requests",
    "food_donates",
    "cloth_donates",
  ];
  if (!validTables.includes(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  const query = `UPDATE ${tableName} SET status = ? WHERE id = ?`;
  db.query(query, [newStatus, postId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      success: true,
      message: `Status updated successfully in ${tableName}`,
    });
  });
});
app.put("/update-verification", (req, res) => {
  const { postId, newVerification, tableName } = req.body;

  if (!postId || !newVerification || !tableName) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const validTables = [
    "blood_requests",
    "food_requests",
    "cloth_requests",
    "food_donates",
    "cloth_donates",
  ];
  if (!validTables.includes(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  const query = `UPDATE ${tableName} SET verified = ? WHERE id = ?`;
  db.query(query, [newVerification, postId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      success: true,
      message: `Post verification updated to ${newVerification}`,
    });
  });
});
app.delete("/delete-post", (req, res) => {
  const { postId, tableName } = req.body;

  if (!postId || !tableName) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const validTables = [
    "blood_requests",
    "food_requests",
    "cloth_requests",
    "food_donates",
    "cloth_donates",
  ];
  if (!validTables.includes(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  const query = `DELETE FROM ${tableName} WHERE id = ?`;
  db.query(query, [postId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ success: true, message: "Post deleted successfully" });
  });
});

app.get("/api/analytics", (req, res) => {
  const query = `
        SELECT 
            (SELECT COUNT(*) FROM food_donates) + (SELECT COUNT(*) FROM cloth_donates) AS total_donations,
            (SELECT COUNT(*) FROM blood_requests) + (SELECT COUNT(*) FROM cloth_requests) + (SELECT COUNT(*) FROM food_requests) AS total_requests,
            (SELECT COUNT(*) FROM donors) AS active_donors,
            (SELECT COUNT(*) FROM volunteers) AS active_volunteers
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});
app.get("/api/donation-distribution", (req, res) => {
  const query = `
        SELECT 
            (SELECT COUNT(*) FROM blood_requests) AS blood,
            (SELECT COUNT(*) FROM food_requests) + (SELECT COUNT(*) FROM food_donates) AS food,
            (SELECT COUNT(*) FROM cloth_requests) + (SELECT COUNT(*) FROM cloth_donates) AS cloth
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const { blood, food, cloth } = results[0];
    const total = blood + food + cloth;

    const distribution = {
      blood: ((blood / total) * 100).toFixed(2),
      food: ((food / total) * 100).toFixed(2),
      cloth: ((cloth / total) * 100).toFixed(2),
    };

    res.json(distribution);
  });
});
app.post("/submit-message", (req, res) => {
  const { name, email, message } = req.body;

  const query = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)";
  db.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Message submitted successfully!" });
  });
});
app.get("/messages", (req, res) => {
  const query = "SELECT * FROM messages ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching messages" });
    }
    res.json(results);
  });
});
app.get("/api/stats", (req, res) => {
  const queries = {
    volunteers: "SELECT COUNT(*) AS count FROM volunteers",
    donors: "SELECT COUNT(*) AS count FROM donors",
    recipients: `
        SELECT 
          (SELECT COUNT(*) FROM food_requests) + 
          (SELECT COUNT(*) FROM cloth_requests) AS count
      `,
    ngos: `SELECT 
          (SELECT COUNT(*) FROM food_requests) + 
          (SELECT COUNT(*) FROM cloth_requests) AS count`,
  };

  const results = {};

  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    db.query(queries[key], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      results[key] = rows[0].count;
      completed++;

      if (completed === keys.length) {
        res.json(results);
      }
    });
  });
});
