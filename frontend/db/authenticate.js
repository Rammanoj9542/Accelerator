const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const yaml = require('js-yaml');
const moment = require('moment');

// Function to get configuration data from a YAML file
function getConfigData() {
    const dbPath = path.join(__dirname);
    const configPath = path.join(dbPath, 'config.yaml');
    return yaml.load(fs.readFileSync(configPath, 'utf8'));
}
const configData = getConfigData();

// MongoDB connection setup
const uri = configData.db_url;
const client = new MongoClient(uri);

// - - - - - - - - - - - - - - - - - - - - - User Authentication & Registration Functions - - - - - - - - - - - - - - - - - - - - - //

// Constant for JWT secret key
const SECRET_KEY = 'your_secret_key';

// Function to generate access token with a 1-hour expiration
function generateAccessToken(userId, role) {
    const expiration_time = Math.floor(Date.now() / 1000) + 3600;
    const access_token = jwt.sign({ userId: userId, role: role, exp: expiration_time }, SECRET_KEY, { algorithm: 'HS256' });
    return access_token;
}

// Function to generate refresh token with a 7-day expiration
function generateRefreshToken(userId, role) {
    const expiration_time = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const refresh_token = jwt.sign({ userId: userId, role: role, exp: expiration_time }, SECRET_KEY, { algorithm: 'HS256' });
    return refresh_token;
}

// Function to generate a random 6-digit OTP
function generateOTP() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return String(randomNumber);
}

// Function to generate user ID
function generateUserID(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let userID = '';
    for (let i = 0; i < length; i++) {
        userID += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return userID;
}

// Function to authenticate a user with username and password
async function authenticateUser(username, password) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const userDetailsCollection = db.collection("userDetails");
        const refreshTokensCollection = db.collection("refreshTokens");
        const userDetails = await userDetailsCollection.findOne({ username, password }, { projection: { _id: 0 } });
        if (userDetails.role === "superadmin" || userDetails.role === "admin" || userDetails.role === "user") {

            const generatedAccessToken = generateAccessToken(userDetails.userid, userDetails.role);
            const generatedRefreshToken = generateRefreshToken(userDetails.userid, userDetails.role);

            // Find and replace the existing token if a record with the same userid exists
            await refreshTokensCollection.updateOne(
                { userid: `${userDetails.userid}` },
                { $set: { refresh_token: generatedRefreshToken } },
                { upsert: true }
            );

            return {
                isUserAuthenticated: true,
                userid: userDetails.userid,
                role: userDetails.role,
                access_token: generatedAccessToken,
                organisation: userDetails.organisation,
                refresh_token: generatedRefreshToken
            }
        } else {
            return { isUserAuthenticated: false };
        }
    } catch (e) {
        console.error(`Error in authenticateUser: ${e}`);
        return false;
    }
}

// Function to create a new user
async function createUser(data) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const userDetailsCollection = db.collection("userDetails");

        const existingUser = await userDetailsCollection.findOne({
            $or: [{ username: data.details.username }, { email: data.details.email }]
        });

        if (existingUser) {
            return { created: false, message: "Username or email already exists" };
        }

        let isUniqueUserID = false;
        let nextUserId;

        // Generate a random 4-digit userID and check if it already exists
        do {
            nextUserId = generateUserID(configData.UserIdLength);
            const existingUser = await userDetailsCollection.findOne({ userid: nextUserId });
            isUniqueUserID = !existingUser;
        } while (!isUniqueUserID);

        const timestamp = moment.utc().unix();
        data.details.timestamp = timestamp;
        data.details.userid = `${nextUserId}`;

        await userDetailsCollection.insertOne(data.details);

        // Retrieve the inserted user's username and password
        const { username, password } = data.details;

        // Call the authenticateUser function to check if the user has been created successfully
        const authenticationResult = await authenticateUser(username, password);

        // Check if the user has been successfully authenticated
        if (authenticationResult && authenticationResult.isUserAuthenticated) {
            return { created: true, userid: nextUserId, message: "User created successfully" }; // User created successfully
        } else {
            // If authentication fails, you might want to remove the user data
            await userDetailsCollection.deleteOne({ username: username });
            return { created: false, message: "User creation failed" };  // User creation failed
        }
    } catch (error) {
        console.error('Error in createUser:', error.message);
        return { created: false, message: "Internal server error" };
    }
}

// Function to get user data by username
async function getUserData(username) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const userDetailsCollection = db.collection("userDetails");
        const user = await userDetailsCollection.findOne({ username: username });

        if (user) {
            return { exists: true, data: user };
        } else {
            return { exists: false, message: "User not found" };
        }
    } catch (error) {
        console.error('Error with database:', error.message);
        return { message: "Internal server error" };
    }
}

// Function to validate email and send OTP
async function validateEmailandSendOTP(data) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const userDetailsCollection = db.collection("userDetails");

        const existingUser = await userDetailsCollection.findOne({ email: data.email });

        if (existingUser) {
            const otp = generateOTP(); // Generate OTP
            const isOTPSent = await sendOTP(data.email, otp); // Call the sendOTP function with the generated OTP

            if (isOTPSent) {
                console.log(`Sent ${otp} to ${email}`);
            }

            if (isOTPSent) {
                return { exists: true, message: "OTP sent successfully" };
            } else {
                return { exists: false, message: "Failed to send OTP" };
            }
        } else {
            return { exists: false, message: "Email not registered" };
        }
    } catch (error) {
        console.error('Error validating email:', error.message);
        return { exists: false, message: "Internal server error" };
    }
}

// Function to send an email with the OTP
async function sendOTP(email, otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    // Email message options
    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP',
        text: `Your OTP is: ${otp}`,
    };

    // Send the email
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true; // Return true if the email is sent successfully
    } catch (error) {
        console.log('Error occurred while sending email:', error.message);
        throw new Error("Failed to send OTP"); // Throw a custom error message if the email fails to send
    }
}

module.exports = [authenticateUser, createUser, getUserData, validateEmailandSendOTP];