// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

// Create an Express application
const app = express();
app.set('trust proxy', 1);
// Set the port for the server
const port = process.env.PORT || 5000;

// Apply CORS middleware to allow cross-origin requests
app.use(cors());

// Apply Helmet middleware to enhance your API's security
app.use(helmet());

// Apply bodyParser middleware for parsing JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Apply rate limiting middleware to all requests
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Define API routes here
// Example: POST route for form submission
app.post('/submit-form', async (req, res) => {
  try {
    // Extract form data from the request body
    const { firstName, lastName, email, phone, message } = req.body;

    // Create a transporter for nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Replace with your email service provider
      auth: {
        user: process.env.EMAIL_USER, // Replace with your email address
        pass: process.env.EMAIL_PASS,  // Replace with your email password or app-specific password
      },
    });

    // Set up email data (should be in the same scope as transporter)
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to: [process.env.EMAIL_USER, process.env.EMAIL_USER_1, process.env.EMAIL_USER_2],   // list of receivers (can be an array)
      subject: 'Form Submission',   // Subject line
      text: `First Name: ${firstName}\nLast Name: ${lastName}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`, // plain text body
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: `An error occurred while processing the form ${error}` });
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../build')));

// All remaining requests return the React app, so it can handle routing
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
