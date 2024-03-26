// index.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// const express = require('express');
const path = require("path");
// const app = express();

// Serve static files from the 'public' directory

require("dotenv").config({
  path: "config.env",
});

const PORT = process.env.PORT || 3000;

app.use("../backend2/public", express.static(path.join(__dirname, "public")));

console.log(process.env.PORT);
console.log(process.env.MONGODB_URI);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "Civilprj",
});

// Define a mongoose schema for your data
const userSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: String,
  location: String,
});

const User = mongoose.model("civilPrj", userSchema);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Set 'views' directory for any views
// being rendered res.render()
app.set("views", path.join(__dirname, "views"));

// Set view engine as EJS
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Define routes
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", (req, res) => {
  const newUser = new User({
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    location: req.body.location,
  });

  newUser
    .save()
    .then(() => {
      // Data saved successfully
      sendConfirmationEmail(req.body.email);
      res.send("Data saved to database and confirmation email sent.");
    })
    .catch((err) => {
      // Handle error
      console.error(err);
      res.send("Error saving to database.");
    });
});

function sendConfirmationEmail(email) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Registration Confirmation",
    text: `Dear Resident,\n
    Thank you for verifying your e-mail address, your registration at our website (NAME OF WEBSITE)
    is now complete, all the further communications shall be sent to this e-mail address.\n
    
    When the Indian Meteorological Department (IMD) issues a coastal flood warning for the areas near
    Adyar basin a flood watch by us shall be provided.\n
    A flood watch means changing weather conditions which can bring high potential for flash floods and
    tidal surges. Warnings pertaining to the level of water levels will be emailed to the user.\n
    
    Warnings pertaining to the level of water levels will be emailed to the user.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
