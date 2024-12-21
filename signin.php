
<?php
// signup.php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = $_POST['fullName'];
    $age = $_POST['age'];
    $email = $_POST['email'];
    $mobile = $_POST['mobile'];
    $location = $_POST['location'];

    // Database connection
    $conn = new mysqli('localhost', 'root', '', 'signup_db');

    if ($conn->connect_error) {
        die('Connection failed: ' . $conn->connect_error);
    }

    // Insert data into the table
    $stmt = $conn->prepare("INSERT INTO users (fullName, age, email, mobile, location, otp) VALUES (?, ?, ?, ?, ?, ?)");
    $otp = rand(100000, 999999); // Generate OTP
    $stmt->bind_param("sisssi", $fullName, $age, $email, $mobile, $location, $otp);

    if ($stmt->execute()) {
        // Send OTP email
        $to = $email;
        $subject = "Your OTP Code";
        $message = "Your OTP code is: $otp";
        $headers = "From: noreply@yourdomain.com";

        if (mail($to, $subject, $message, $headers)) {
            echo "An OTP has been sent to your email address.";
        } else {
            echo "Failed to send OTP email.";
        }
    } else {
        echo "Failed to sign up.";
    }

    $stmt->close();
    $conn->close();
}
?>
