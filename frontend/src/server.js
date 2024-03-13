const express = require('express');
const cors = require('cors');
const session = require('express-session');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bodyParser = require('body-parser');
const AES = require('crypto-js/aes');
const encUtf8 = require('crypto-js/enc-utf8');
const path = require('path');
const fs = require('fs');
const app = express();
const xss = require('xss');
const winston = require('winston');
const fileUpload = require('express-fileupload');

const configData = require('./constants/config.json');
const RAG_API_URL = configData.RAG_API_URL;

// Import database functions
require('../db/database');
const [authenticateUser, createUser, getUserData, validateEmailandSendOTP] = require('../db/authenticate');
const [addClientApiKeys, getClientApiKeys, getClientApiKeysData, addOrg, getOrgIds, updateOrg, getFullOrgsData, updateAdmin, getFullAdminsData, addDeployment, getDeploymentIds, updateDeployment, getDeploymentDetails] = require('../db/utils');
const [getSttModes, getSttModelsTypes, addSttModel, getSttModelDetails, getSTTModelNames, getSTTEngines, addSttConfig, getSttConfigDetails, getSttModelIds, updateSttModel, getSttConfigIds, updateSttConfig] = require('../db/stt');
const [getLLMModeTypes, getModels, getLLMModelNames, getEngines, addLlmModel, getLlmModelDetails, getLlmModelIds, updateLlmModel, addPrompt, getLlmPromptsData, getLlmPromptIds, updatePrompt] = require('../db/llm');
const [getRAGModelNames, getRAGDeviceTypes, getRagModelIds, addRagModel, updateRagModel, getRagModelDetails, addRagConfig, getRagConfigIds, updateRagConfig, getRagConfigDetails] = require('../db/rag')

// Define encryption key and initialization vector
const key = "kojsnhfitonhsuth";
const iv = "odbshirnkofgfffs";

const currentDir = __dirname;
const parentDir = path.join(currentDir, '..', '..');

// Upload files path
const preingestDir = path.join(parentDir, "preingest");
const postingestDir = path.join(parentDir, "postingest");

// Create the uploads directories if it does not exist
if (!fs.existsSync(preingestDir)) {
    fs.mkdirSync(preingestDir);
    console.log("Created preingest directory");
}

if (!fs.existsSync(postingestDir)) {
    fs.mkdirSync(postingestDir);
    console.log("Created postingest directory");
}

// Logging
const logdir = path.join(parentDir, "logs");
const log_frontenddir = path.join(logdir, "frontend");

// Create the log and frontend log directory if they does not exist
if (!fs.existsSync(logdir)) {
    fs.mkdirSync(logdir);
    console.log("Created logs directory");
}

if (!fs.existsSync(log_frontenddir)) {
    fs.mkdirSync(log_frontenddir);
    console.log("Created frontend logs directory");
}

// Create an empty log file with the current date if it does not exist
const logFileName = `${moment().format('DD-MM-YYYY')}.txt`;
const logFilePath = path.join(log_frontenddir, logFileName);

if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, ''); // Create an empty log file
}

// Configure winston logger
const logger = winston.createLogger({
    level: 'info', // Default level
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss', // Specify the timestamp format
        }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] - ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: logFilePath,
            level: 'info',
        }), // Log to file with 'info' level
        new winston.transports.Console({
            level: 'debug',
        }), // Log to console with 'debug' level
    ],
});

// Serve static files from the 'build' directory
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// Configure session middleware
app.use(
    session({
        secret: crypto.randomBytes(32).toString('hex'), // Replace with your own secret key
        resave: false,
        saveUninitialized: false,
    })
);
app.use(bodyParser.json());
app.use(cors());

// Use express-fileupload middleware
app.use(fileUpload());

// Handle user login
app.post('/login', async (req, res) => {
    const encryptedUsername = req.body.username;
    const encryptedPassword = req.body.password;
    const userTimezone = req.body.userTimezone;

    const username = AES.decrypt(encryptedUsername, key, { iv: encUtf8.parse(iv) }).toString(encUtf8);
    const password = AES.decrypt(encryptedPassword, key, { iv: encUtf8.parse(iv) }).toString(encUtf8);

    logger.info(`${username} - Login request received.`);
    try {
        const isUserAuthenticated = await authenticateUser(username, password);

        if (isUserAuthenticated) {
            req.session.username = xss(username);
            req.session.userid = xss(isUserAuthenticated.userid);
            req.session.role = xss(isUserAuthenticated.role);
            req.session.access_token = xss(isUserAuthenticated.access_token);
            req.session.refresh_token = xss(isUserAuthenticated.refresh_token);
            req.session.organisation = xss(isUserAuthenticated.organisation);
            req.session.userTimezone = userTimezone;

            logger.info(`${username} - Logged in successfully.`);
            res.status(200).json({ message: 'Authentication successful', role: isUserAuthenticated.role });
        } else {
            logger.info(`${username} - Login request failed due to invalid credentials.`);
            res.status(401).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        logger.error(`Internal server error while logging in: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to check for a valid token
function tokenRequired(req, res, next) {
    const token = req.session.access_token;

    if (!token) {
        console.log("Token is missing.");
        return res.redirect('/');
    }

    // Debugging the token format and content
    SECRET_KEY = 'your_secret_key';

    try {
        const data = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });
        const userId = data.userId; // Retrieve 'userId' from the token payload
        req.userId = userId; // Attach 'userId' to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log("Token has expired.");
            return res.redirect('/');
        } else {
            console.log("Token is invalid.");
            return res.redirect('/');
        }
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/userhome', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const user_role = req.session.role;
    if (user_role != "user") {
        return res.redirect("/");
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/adminhome', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const user_role = req.session.role;
    if (user_role != "admin") {
        return res.redirect("/");
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/superadminhome', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
    const user_role = req.session.role;
    if (user_role != "superadmin") {
        return res.redirect("/");
    }
});

app.get('/passwordreset', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/stt', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/llm', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/rag', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/account', tokenRequired, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Route for initiating the password reset process
app.post('/reset_password', async (req, res) => {
    const email = xss(req.body.email);
    logger.info(`Reset password request received from ${email}`);

    try {
        const validateEmailandSendOTPResult = await validateEmailandSendOTP(email);

        if (validateEmailandSendOTPResult.exists) {
            logger.info(`OTP sent successfully to ${email}`);
            res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            logger.info(`Failed to send OTP to ${email}: ${validateEmailandSendOTPResult.message}`);
            res.status(404).json({ message: validateEmailandSendOTPResult.message });
        }
    } catch (error) {
        console.error('Error:', error.message);
        logger.error(`Internal server error while sending OTP: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to retrieve user details based on the username stored in the session
app.post('/get_user_details', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Requested for user details received.`);

    try {
        // Make a POST request to the backend route
        const response = await getUserData(username);

        if (response.exists) {
            logger.info(`${username} - User data retrieved successfully.`);
            res.status(200).json(response.data);
        } else {
            logger.error(`${username} - Failed to retrieve user data: ${response.message}`);
            res.status(404).json({ message: response.message });
        }
    } catch (error) {
        console.error('Error:', error.message);
        logger.error(`${username} - Internal server error while fetching user details: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for user registration
app.post('/register', tokenRequired, async (req, res) => {
    const { username } = req.session;

    try {
        // Extract form data or JSON data from the frontend (adjust as needed)
        const details = {
            userid: '',
            firstname: xss(req.body.firstname),
            lastname: xss(req.body.lastname),
            username: xss(req.body.username.toLowerCase()),
            password: xss(req.body.password),
            email: xss(req.body.email_address),
            number: xss(req.body.contactnumber),
            role: '',
            tempOTP: '',
            tempOTPtimestamp: '',
            OTPattempts: '',
            OTPlocked: false,
            OTPlockedtill: '',
            organisation: ''
        };

        if (req.session.role === "superadmin") {
            details.role = "admin";
            details.organisation = xss(req.body.organisation);
        } else if (req.session.role === "admin") {
            details.role = "user";
            details.organisation = req.session.organisation;
        }

        logger.info(`${username} - Registration request received for ${details.username}`);
        const data = { details: details };

        // Send the data as JSON to the database
        const createUserResult = await createUser(data);

        if (createUserResult.created) {
            logger.info(`${username} - User ${details.username} registered successfully.`);
            res.status(200).json({ userid: createUserResult.userid, message: createUserResult.message });
        } else {
            logger.info(`${username} - Failed to create user: ${createUserResult.message}`);
            res.status(400).json({ message: createUserResult.message });
        }
    } catch (error) {
        console.error('Error:', error.message);
        logger.error(`${username} - Internal server error while registering user: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for user logout
app.get('/logout', (req, res) => {
    const { username } = req.session;

    req.session.destroy(err => {
        if (err) {
            console.error('Error while logging out:', err);
            logger.error(`${username} - Error while logging out: ${err}`);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Return a success message indicating logout
        logger.info(`${username} - Logged out successfully.`);
        res.status(200).json({ message: 'Logout successful' });
    });
});

// Route for generating a client API key during user registration
app.post('/generateclientApiKeyWhileRegistration', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const userid = xss(req.body.userid);
    logger.info(`${username} - Generating client API key during registration.`);

    try {
        const isKeyAdded = await addClientApiKeys(userid);
        if (isKeyAdded) {
            logger.info(`${username} - Client API key created successfully.`);
            res.status(200).json({ message: "Key created successfully" });
        } else if (!isKeyAdded) {
            logger.info(`${username} - Key could not be added.`);
            res.status(400);
            return;
        }
    } catch (e) {
        console.error(`Error generating key: ${e}`);
        logger.error(`${loggedInUser} - Error generating key: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for generating a new client API key
app.post('/generateNewClientApiKey', tokenRequired, async (req, res) => {
    const { userid, username } = req.session;
    logger.info(`${username} - Generating new client API key.`);

    try {
        const isKeyAdded = await addClientApiKeys(userid);
        if (isKeyAdded) {
            logger.info(`${username} - New client API key created successfully.`);
            res.status(200).json({ message: "Key created successfully" });
        } else if (!isKeyAdded) {
            logger.info(`${username} - Key could not be added.`);
            res.status(400);
            return;
        }
    } catch (e) {
        console.error(`Error generating key: ${e}`);
        logger.error(`${username} - Error generating API key: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for fetching client API keys
app.post('/clientApiKeys', tokenRequired, async (req, res) => {
    const { userid, username } = req.session;
    logger.info(`${username} - Fetching client API keys.`);

    try {
        const clientApiKeys = await getClientApiKeys(userid);
        logger.info(`${username} - Client API keys fetched successfully.`);
        res.status(200).json(clientApiKeys);
    } catch (e) {
        console.error(`Error fetching keys: ${e}`);
        logger.error(`${username} - Error fetching API keys: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Convert UTC timestamp to user's local time
const convertTimestampToLocal = (timestamp, timezone) => {
    return momentTimezone.unix(timestamp).tz(timezone).format('DD-MM-YYYY HH:mm:ss');
};

// Route to fetch client API keys data
app.post('/clientApiKeysData', tokenRequired, async (req, res) => {
    const { userid, username, userTimezone } = req.session;
    logger.info(`${username} - Fetching client API keys data.`);

    try {
        const clientApiKeysData = await getClientApiKeysData(userid);
        logger.info(`${username} - Client API keys data fetched successfully.`);

        // Convert each timestamp to local time
        clientApiKeysData.forEach((keyData) => {
            keyData.timestamp = convertTimestampToLocal(keyData.timestamp, userTimezone);
        });

        res.status(200).json(clientApiKeysData);
    } catch (e) {
        console.error(`Error fetching keys: ${e}`);
        logger.error(`${username} - Error fetching keys: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/addOrg', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const orgName = xss(req.body.orgName.toLowerCase());
    const orgAddress = xss(req.body.orgAddress);
    const dbURI = xss(req.body.dbURI);
    logger.info(`${username} - Adding a new organisation.`);

    try {
        const isOrgAdded = await addOrg(orgName, orgAddress, dbURI);
        if (isOrgAdded) {
            logger.info(`${username} - New org added successfully.`);
            res.status(200).json({ message: "Org added successfully" });
        } else if (!isOrgAdded) {
            logger.info(`${username} - Org could not be added.`);
            res.status(400).json({ error: "Org already exists" });
        }
    } catch (e) {
        console.error(`Error adding new Org model: ${e}`);
        logger.error(`${username} - Error adding new Org: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/getOrgIds', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching Org IDs.`);

    try {
        const orgIds = await getOrgIds();
        logger.info(`${username} - Org IDs fetched successfully.`);
        res.status(200).json(orgIds);
    } catch (e) {
        console.error(`Error fetching Org IDs: ${e}`);
        logger.error(`${username} - Error fetching Org IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/updateOrg', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const orgId = xss(req.body.orgId);
    const orgName = xss(req.body.orgName.toLowerCase());
    const orgAddress = xss(req.body.orgAddress);
    const dbURI = xss(req.body.dbURI);
    logger.info(`${username} - Updating an organisation.`);

    try {
        const isOrgUpdated = await updateOrg(orgId, orgName, orgAddress, dbURI);
        if (isOrgUpdated) {
            logger.info(`${username} - Org updated successfully.`);
            res.status(200).json({ message: "Org updated successfully" });
        } else if (!isOrgUpdated) {
            logger.info(`${username} - Org could not be updated.`);
            res.status(400).json({ error: "Org already exists" });
        }
    } catch (e) {
        console.error(`Error updated Org: ${e}`);
        logger.error(`${username} - Error updated Org: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/getFullOrgsData', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching full orgs data.`);

    try {
        const fullOrgsData = await getFullOrgsData();
        logger.info(`${username} - Full orgs data fetched successfully.`);
        res.status(200).json(fullOrgsData);
    } catch (e) {
        console.error(`Error fetching full orgs data: ${e}`);
        logger.error(`${username} - Error fetching full orgs data: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/updateAdmin', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const selectedUsername = xss(req.body.username);
    const selectedOrg = xss(req.body.organisation);
    logger.info(`${username} - Updating an admin.`);

    try {
        const isAdminUpdated = await updateAdmin(selectedUsername, selectedOrg);
        if (isAdminUpdated) {
            logger.info(`${username} - Admin updated successfully.`);
            res.status(200).json({ message: "Admin updated successfully" });
        } else if (!isAdminUpdated) {
            logger.info(`${username} - Admin could not be updated.`);
            res.status(400).json({ error: "Admin already exists" });
        }
    } catch (e) {
        console.error(`Error updated Admin: ${e}`);
        logger.error(`${username} - Error updated Admin: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/getFullAdminsData', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching full admins data.`);

    try {
        const fullAdminsData = await getFullAdminsData();
        logger.info(`${username} - Full admins data fetched successfully.`);
        res.status(200).json(fullAdminsData);
    } catch (e) {
        console.error(`Error fetching full admins data: ${e}`);
        logger.error(`${username} - Error fetching full admins data: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - STT Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Route to get the available modes for STT
app.post('/stt/getModes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching available STT modes.`);

    try {
        const modesList = await getSttModes();
        logger.info(`${username} - Available STT modes fetched successfully.`);
        res.json(modesList);
    } catch (error) {
        logger.error(`${username} - Error fetching available STT modes: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the models for STT transcribe
app.post('/stt/getTranscribeModelTypes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching STT transcribe model types.`);

    try {
        const modelsList = await getSttModelsTypes();
        logger.info(`${username} - STT transcribe model types fetched successfully.`);
        res.status(200).json(modelsList);
    } catch (error) {
        logger.error(`${username} - Error fetching STT transcribe model types: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get speech-to-text model IDs
app.post('/stt/getModelIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching STT model IDs.`);

    try {
        const modelIds = await getSttModelIds(organisation, clientApiKey);
        logger.info(`${username} - STT model IDs fetched successfully.`);
        res.status(200).json(modelIds);
    } catch (e) {
        console.error(`Error fetching STT model IDs: ${e}`);
        logger.error(`${username} - Error fetching STT model IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get speech-to-text configuration IDs
app.post('/stt/getConfigIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching STT config IDs.`);

    try {
        const configIds = await getSttConfigIds(organisation, clientApiKey);
        logger.info(`${username} - STT config IDs fetched successfully.`);
        res.status(200).json(configIds);
    } catch (e) {
        console.error(`Error fetching STT config IDs: ${e}`);
        logger.error(`${username} - Error fetching STT config IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to add a new speech-to-text model
app.post('/stt/addNewModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelType = xss(req.body.modelType);
    const modelName = xss(req.body.modelName);
    const engine = xss(req.body.engine);
    logger.info(`${username} - Adding a new STT model.`);

    try {
        const isModelAdded = await addSttModel(organisation, apikey, modelType, modelName, engine);
        if (isModelAdded) {
            logger.info(`${username} - New STT model added successfully.`);
            res.status(200).json({ message: "Model added successfully" });
        } else if (!isModelAdded) {
            logger.info(`${username} - STT Model could not be added.`);
            res.status(400).json({ error: "Model ID already exists" });
        }
    } catch (e) {
        console.error(`Error adding new STT model: ${e}`);
        logger.error(`${username} - Error adding new STT model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to update an existing speech-to-text model
app.post('/stt/updateModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelid = xss(req.body.modelid);
    const modelType = xss(req.body.modelType);
    const modelName = xss(req.body.modelName);
    const engine = xss(req.body.engine);
    logger.info(`${username} - Updating an STT model.`);

    try {
        const isModelUpdated = await updateSttModel(organisation, apikey, modelid, modelType, modelName, engine);
        if (isModelUpdated) {
            logger.info(`${username} - STT model updated successfully.`);
            res.status(200).json({ message: "Model updated successfully" });
        } else if (!isModelUpdated) {
            logger.info(`${username} - STT Model could not be updated.`);
            res.status(400).json({ error: "Model could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating STT model: ${e}`);
        logger.error(`${username} - Error updating STT model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of a speech-to-text model
app.post('/stt/getFullModelDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full STT model details.`);

    try {
        const STTModelDetails = await getSttModelDetails(organisation, clientApiKey);
        logger.info(`${username} - Full STT model details fetched successfully.`);
        res.status(200).json(STTModelDetails);
    } catch (e) {
        console.error(`Error fetching model details: ${e}`);
        logger.error(`${username} - Error fetching full STT model details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get the names of STT models
app.post('/stt/getModelNames', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const modelType = xss(req.body.modelType);
    logger.info(`${username} - Fetching names of STT models for modelType: ${modelType}.`);

    try {
        const modelNameList = await getSTTModelNames(modelType);
        logger.info(`${username} - Names of STT models fetched successfully for modelType: ${modelType}.`);
        res.json(modelNameList);
    } catch (error) {
        logger.error(`${username} - Error fetching names of STT models: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the engines for a particular language model
app.post('/stt/getEngines', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const modelType = xss(req.body.modelType)
    const modelName = xss(req.body.modelName);
    logger.info(`${username} - Fetching engines for STT model: ${modelName}.`);

    try {
        const engineList = await getSTTEngines(modelType, modelName);
        logger.info(`${username} - Engines fetched successfully for STT model: ${modelName}.`);
        res.json(engineList);
    } catch (error) {
        logger.error(`${username} - Error fetching engines for STT model ${modelName}: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to add a new speech-to-text configuration
app.post('/stt/addNewConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const mode = xss(req.body.mode);
    logger.info(`${username} - Adding a new STT config.`);

    try {
        const isConfigAdded = await addSttConfig(organisation, apikey, mode);
        if (isConfigAdded) {
            logger.info(`${username} - New STT config added successfully.`);
            res.status(200).json({ message: "Config added successfully" });
        } else if (!isConfigAdded) {
            logger.info(`${username} - Config could not be added.`);
            res.status(400).json({ error: "Config could not be added" });
        }
    } catch (e) {
        console.error(`Error adding new config: ${e}`);
        logger.info(`${username} - Error adding new STT config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to update an existing speech-to-text configuration
app.post('/stt/updateConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const sttid = xss(req.body.sttid);
    const mode = xss(req.body.mode);
    logger.info(`${username} - Updating an existing STT configuration.`);

    try {
        const isConfigUpdated = await updateSttConfig(organisation, apikey, sttid, mode);
        if (isConfigUpdated) {
            logger.info(`${username} - STT configuration updated successfully.`);
            res.status(200).json({ message: "Config updated successfully" });
        } else if (!isConfigUpdated) {
            logger.info(`${username} - STT Config could not be updated.`);
            res.status(400).json({ error: "Config could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating config: ${e}`);
        logger.error(`${username} - Error updating STT config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of a speech-to-text configuration              
app.post('/stt/getFullConfigDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full STT config details.`);

    try {
        const STTConfigDetails = await getSttConfigDetails(organisation, clientApiKey);
        logger.info(`${username} - Full STT config details fetched successfully.`);
        res.status(200).json(STTConfigDetails);
    } catch (e) {
        console.error(`Error fetching config details: ${e}`);
        logger.error(`${username} - Error fetching Full STT config details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - LLM Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Route to get the IDs of language model models
app.post('/llm/getModelIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching LLM model IDs.`);

    try {
        const modelIds = await getLlmModelIds(organisation, clientApiKey);
        logger.info(`${username} - LLM model IDs fetched successfully.`);
        res.status(200).json(modelIds);
    } catch (e) {
        console.error(`Error fetching LLM model IDs: ${e}`);
        logger.error(`${username} - Error fetching LLM model IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get the available modes for language model
app.post('/llm/getModes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching available LLM model modes.`);

    try {
        const modeTypesList = await getLLMModeTypes();
        logger.info(`${username} - Available LLM model modes fetched successfully.`);
        res.json(modeTypesList);
    } catch (error) {
        logger.error(`${username} - Error fetching available LLM model modes: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the models of a particular mode for language model
app.post('/llm/getModels', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const mode = xss(req.body.mode);
    logger.info(`${username} - Fetching LLM models for mode: ${mode}.`);

    try {
        const modelList = await getModels(mode);
        logger.info(`${username} - LLM models fetched successfully for mode: ${mode}.`);
        res.status(200).json(modelList);
    } catch (error) {
        logger.error(`${username} - Error fetching LLM models for mode ${mode}: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the names of LLM models
app.post('/llm/getModelNames', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const model = xss(req.body.model);
    logger.info(`${username} - Fetching names of LLM models for model: ${model}.`);

    try {
        const modelNameList = await getLLMModelNames(model);
        logger.info(`${username} - Names of LLM models fetched successfully for model: ${model}.`);
        res.json(modelNameList);
    } catch (error) {
        logger.error(`${username} - Error fetching names of LLM model names: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get the engines for a particular language model
app.post('/llm/getEngines', tokenRequired, async (req, res) => {
    const { username } = req.session;
    const modelName = xss(req.body.modelName);
    logger.info(`${username} - Fetching engines for LLM model: ${modelName}.`);

    try {
        const engineList = await getEngines(modelName);
        logger.info(`${username} - Engines fetched successfully for LLM model: ${modelName}.`);
        res.json(engineList);
    } catch (error) {
        logger.error(`${username} - Error fetching engines for LLM model ${modelName}: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route for adding a new language model
app.post('/llm/addNewModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const mode = xss(req.body.mode);
    const model = xss(req.body.model);
    const modelName = xss(req.body.modelName);
    const engine = xss(req.body.engine);
    const cloudAPIKey = xss(req.body.cloudAPIKey);
    logger.info(`${username} - Adding a new LLM model.`);

    try {
        const isModelAdded = await addLlmModel(organisation, apikey, mode, model, modelName, engine, cloudAPIKey);
        if (isModelAdded) {
            logger.info(`${username} - New LLM model added successfully.`);
            res.status(200).json({ message: "Model added successfully" });
        } else if (!isModelAdded) {
            logger.info(`${username} - LLM Model could not be added.`);
            res.status(400).json({ error: "Model ID already exists" });
        }
    } catch (e) {
        console.error(`Error adding new model: ${e}`);
        logger.error(`${username} - Error adding new LLM model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for updating an existing language model
app.post('/llm/updateModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelid = xss(req.body.modelid);
    const mode = xss(req.body.mode);
    const model = xss(req.body.model);
    const modelName = xss(req.body.modelName);
    const engine = xss(req.body.engine);
    const cloudAPIKey = xss(req.body.cloudAPIKey);
    logger.info(`${username} - Updating an existing LLM model.`);

    try {
        const isModelUpdated = await updateLlmModel(organisation, apikey, modelid, mode, model, modelName, engine, cloudAPIKey);
        if (isModelUpdated) {
            logger.info(`${username} - LLM model updated successfully.`);
            res.status(200).json({ message: "Model updated successfully" });
        } else if (!isModelUpdated) {
            logger.info(`${username} - LLM Model could not be updated.`);
            res.status(400).json({ error: "Model could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating model: ${e}`);
        logger.error(`${username} - Error updating LLM model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for getting the full details of a language model (LLM) with the specified client API key
app.post('/llm/getFullModelDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full details of LLM models.`);

    try {
        const LLMModelDetails = await getLlmModelDetails(organisation, clientApiKey);
        logger.info(`${username} - Full details of LLM models fetched successfully.`);
        res.status(200).json(LLMModelDetails);
    } catch (e) {
        console.error(`Error fetching LLM model details: ${e}`);
        logger.error(`${username} - Error fetching LLM model details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for adding a prompt to a language model
app.post('/llm/addPrompt', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    let json_data = req.body;
    logger.info(`${username} - Adding a new LLM prompt.`);

    try {
        const addPromptResult = await addPrompt(organisation, json_data);
        if (addPromptResult) {
            logger.info(`${username} - New LLM prompt added successfully.`);
            res.status(200).json({ message: "Prompt added successfully" });
        } else if (!addPromptResult) {
            logger.info(`${username} - LLM Prompt could not be added.`);
            res.status(400).json({ error: "Prompt could not be added" });
        }
    } catch (error) {
        logger.error(`${username} - Error adding new LLM prompt: ${error}`);
        res.status(500).json({ message: "An error occurred", error: error.toString() });
    }
});

// Route for getting the full data of prompts associated with a language model (LLM) using the specified client API key
app.post('/llm/getFullPromptsData', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full details of LLM model prompts.`);

    try {
        const LLMPromptsData = await getLlmPromptsData(organisation, clientApiKey);
        logger.info(`${username} - Full details of LLM model prompts fetched successfully.`);
        res.status(200).json(LLMPromptsData);
    } catch (e) {
        console.error(`Error fetching prompt details: ${e}`);
        logger.error(`${username} - Error fetching LLM prompt details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for getting the prompt IDs associated with a language model (LLM) using the specified client API key
app.post('/llm/getPromptIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching LLM model prompt IDs.`);

    try {
        const promptIds = await getLlmPromptIds(organisation, clientApiKey);
        logger.info(`${username} - LLM model prompt IDs fetched successfully.`);
        res.status(200).json(promptIds);
    } catch (e) {
        console.error(`Error fetching prompts: ${e}`);
        logger.error(`${username} - Error fetching LLM prompts: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for updating a prompt of a language model (LLM) with the provided JSON data
app.post('/llm/updatePrompt', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const json_data = req.body;
    logger.info(`${username} - Updating an existing LLM model prompt.`);

    try {
        const isPromptUpdated = await updatePrompt(organisation, json_data);
        if (isPromptUpdated) {
            logger.info(`${username} - Existing LLM model prompt updated successfully.`);
            res.status(200).json({ message: "Prompt Updated Successfully" });
        } else if (!isPromptUpdated) {
            logger.info(`${username} - LLM Prompt could not be updated.`);
            res.status(400).json({ error: "Prompt could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating prompt: ${e}`);
        logger.error(`${username} - Error updating LLM prompt: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - RAG Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Route to get the names of RAG models
app.post('/rag/getModelNames', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching names of RAG models.`);

    try {
        const modelNameList = await getRAGModelNames();
        logger.info(`${username} - Names of RAG models fetched successfully.`);
        res.json(modelNameList);
    } catch (error) {
        logger.error(`${username} - Error fetching model names of RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get device types for RAG models
app.post('/rag/getDeviceTypes', tokenRequired, async (req, res) => {
    const { username } = req.session;
    logger.info(`${username} - Fetching device types for RAG models.`);

    try {
        const deviceTypesList = await getRAGDeviceTypes();
        logger.info(`${username} - Device types for RAG models fetched successfully.`);
        res.json(deviceTypesList);
    } catch (error) {
        logger.error(`${username} - Error fetching device types for RAG: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// Route to get RAG model IDs
app.post('/rag/getModelIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching RAG model IDs.`);

    try {
        const modelIds = await getRagModelIds(organisation, clientApiKey);
        logger.info(`${username} - RAG model IDs fetched successfully.`);
        res.status(200).json(modelIds);
    } catch (e) {
        console.error(`Error fetching RAG model IDs: ${e}`);
        logger.error(`${username} - Error fetching RAG model IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get RAG configuration IDs
app.post('/rag/getConfigIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching RAG config IDs.`);

    try {
        const configIds = await getRagConfigIds(organisation, clientApiKey);
        logger.info(`${username} - RAG config IDs fetched successfully.`);
        res.status(200).json(configIds);
    } catch (e) {
        console.error(`Error fetching RAG config IDs: ${e}`);
        logger.error(`${username} - Error fetching RAG config IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to add a new RAG model
app.post('/rag/addNewModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelName = xss(req.body.modelName);
    const deviceType = xss(req.body.deviceType);
    logger.info(`${username} - Adding a new RAG model.`);

    try {
        const isModelAdded = await addRagModel(organisation, apikey, modelName, deviceType);
        if (isModelAdded) {
            logger.info(`${username} - New RAG model added successfully.`);
            res.status(200).json({ message: "Model added successfully" });
        } else if (!isModelAdded) {
            logger.info(`${username} - RAG Model could not be added.`);
            res.status(400).json({ error: "Model ID already exists" });
        }
    } catch (e) {
        console.error(`Error adding new RAG model: ${e}`);
        logger.error(`${username} - Error adding new RAG model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for updating an existing RAG model
app.post('/rag/updateModel', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const modelid = xss(req.body.modelid);
    const modelName = xss(req.body.modelName);
    const deviceType = xss(req.body.deviceType);
    logger.info(`${username} - Updating an existing RAG model.`);

    try {
        const isModelUpdated = await updateRagModel(organisation, apikey, modelid, modelName, deviceType);
        if (isModelUpdated) {
            logger.info(`${username} - RAG model updated successfully.`);
            res.status(200).json({ message: "Model updated successfully" });
        } else if (!isModelUpdated) {
            logger.info(`${username} - RAG Model could not be updated.`);
            res.status(400).json({ error: "Model could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating model: ${e}`);
        logger.error(`${username} - Error updating RAG model: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of RAG models
app.post('/rag/getFullModelDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full RAG model details.`);

    try {
        const RAGModelDetails = await getRagModelDetails(organisation, clientApiKey);
        logger.info(`${username} - Full RAG model details fetched successfully.`);
        res.status(200).json(RAGModelDetails);
    } catch (e) {
        console.error(`Error fetching model details: ${e}`);
        logger.error(`${username} - Error fetching full RAG model details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to add a new RAG configuration
app.post('/rag/addNewConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const size = xss(req.body.chunkSize);
    const overlap = xss(req.body.chunkOverlap);
    const path = xss(req.body.path);
    logger.info(`${username} - Adding a new RAG config.`);

    try {
        const isConfigAdded = await addRagConfig(organisation, apikey, size, overlap, path);
        if (isConfigAdded) {
            logger.info(`${username} - New RAG config added successfully.`);
            res.status(200).json({ message: "Config added successfully" });
        } else if (!isConfigAdded) {
            logger.info(`${username} - Config could not be added.`);
            res.status(400).json({ error: "Config could not be added" });
        }
    } catch (e) {
        console.error(`Error adding new config: ${e}`);
        logger.info(`${username} - Error adding new RAG config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to update an existing RAG configuration
app.post('/rag/updateConfig', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const configId = xss(req.body.configId);
    const size = xss(req.body.size);
    const overlap = xss(req.body.overlap);
    const path = xss(req.body.path);
    logger.info(`${username} - Updating an existing RAG configuration.`);

    try {
        const isConfigUpdated = await updateRagConfig(organisation, apikey, configId, size, overlap, path);
        if (isConfigUpdated) {
            logger.info(`${username} - RAG configuration updated successfully.`);
            res.status(200).json({ message: "Config updated successfully" });
        } else if (!isConfigUpdated) {
            logger.info(`${username} - RAG Config could not be updated.`);
            res.status(400).json({ error: "Config could not be updated" });
        }
    } catch (e) {
        console.error(`Error updating config: ${e}`);
        logger.error(`${username} - Error updating RAG config: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route to get full details of a RAG configuration
app.post('/rag/getFullConfigDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    logger.info(`${username} - Fetching full RAG config details.`);

    try {
        const RAGConfigDetails = await getRagConfigDetails(organisation, clientApiKey);
        logger.info(`${username} - Full RAG config details fetched successfully.`);
        res.status(200).json(RAGConfigDetails);
    } catch (e) {
        console.error(`Error fetching config details: ${e}`);
        logger.error(`${username} - Error fetching Full RAG config details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/rag/uploadFiles', tokenRequired, (req, res) => {
    if (!req.files || (Array.isArray(req.files.files) && req.files.files.length === 0)) {
        return res.status(400).send('No files were uploaded.');
    }

    const uploadedFiles = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const { username } = req.session;

    const userPreingestDir = path.join(preingestDir, `${username}`);
    if (!fs.existsSync(userPreingestDir)) {
        fs.mkdirSync(userPreingestDir);
        console.log(`Created preingest directory for ${username}`);
        logger.info(`${username} - Created preingest directory for ${username}.`);
    }

    // Handle each file
    for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];
        const uploadPath = path.join(userPreingestDir, uploadedFile.name);

        uploadedFile.mv(uploadPath, (err) => {
            if (err) {
                logger.error(`${username} - Error uploading files: ${err}`);
                return res.status(500).send(err);
            }
        });
    }

    res.status(200).send('Files uploaded successfully!');
    logger.info(`${username} - Uploaded file(s) to preingest`);
});

app.post('/rag/ingestFiles', tokenRequired, async (req, res) => {
    const { username } = req.session;

    const data = {
        username: username
    }

    try {
        const apiResponse = await axios.post(RAG_API_URL + '/rag/run_ingest', data);

        if (apiResponse.status === 200) {
            // return res.status(200).json(apiResponse.data);
            return res.status(200).json({ message: 'Ingestion successful' });
        } else {
            return res.status(apiResponse.status).json({ message: 'Failed to ingest' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).end();
    }
});

app.post('/rag/moveFiles', tokenRequired, (req, res) => {
    const { username } = req.session;

    const userPreingestDir = path.join(preingestDir, `${username}`);
    const userPostingestDir = path.join(postingestDir, `${username}`);
    if (!fs.existsSync(userPostingestDir)) {
        fs.mkdirSync(userPostingestDir);
        console.log(`Created postingest directory for ${username}`);
        logger.info(`${username} - Created postingest directory for ${username}.`);
    }

    // Move files from preingest to postingest folder
    fs.readdir(userPreingestDir, (err, files) => {
        if (err) {
            logger.error(`${username} - Error reading preingest directory: ${err}`);
            return res.status(500).send(err);
        }

        files.forEach((file) => {
            const preingestFilePath = path.join(userPreingestDir, file);

            // Generate timestamp and create a new filename
            const timestamp = moment.utc().unix();
            const newFileName = `${timestamp}_${file}`;

            const postingestFilePath = path.join(userPostingestDir, newFileName);

            fs.rename(preingestFilePath, postingestFilePath, (err) => {
                if (err) {
                    logger.error(`${username} - Error moving file from preingest to postingest: ${err}`);
                    return res.status(500).send(err);
                }
            });
        });
    });

    res.status(200).send('Files moved successfully!');
    logger.info(`${username} - Moved file(s) to postingest.`);
});

app.post('/rag/deleteFiles', tokenRequired, (req, res) => {
    const { username } = req.session;

    const userPreingestDir = path.join(preingestDir, username);

    // Attempt to delete files
    fs.readdir(userPreingestDir, (err, files) => {
        if (err) {
            // Handle readdir error
            console.error(`Error reading directory ${userPreingestDir}: ${err}`);
            return res.status(500).send('Internal Server Error');
        }

        // Delete each file in the directory
        files.forEach(file => {
            const filePath = path.join(userPreingestDir, file);
            fs.unlink(filePath, err => {
                if (err) {
                    // Handle unlink error
                    console.error(`Error deleting file ${filePath}: ${err}`);
                }
            });
        });

        // Send response after attempting to delete files
        res.status(200).send('Files deleted successfully!');
        logger.info(`${username} - Deleted file(s) from preingest.`);
    });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - Deployment Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Route to get deployment IDs
app.post('/getDeploymentIds', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const clientApiKey = xss(req.body.clientApiKey);
    const type = xss(req.body.type);
    logger.info(`${username} - Fetching deployment IDs.`);

    try {
        const deploymentIds = await getDeploymentIds(organisation, clientApiKey, type);
        logger.info(`${username} - Deployment IDs fetched successfully.`);
        res.status(200).json(deploymentIds);
    } catch (e) {
        console.error(`Error fetching ${type} deployment IDs: ${e}`);
        logger.error(`${username} - Error fetching ${type} deployment IDs: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

// Route for adding a new deployment
app.post('/addDeployment', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const type = xss(req.body.type);
    logger.info(`${username} - Adding a new ${type} deployment.`);

    if (type === 'llm') {
        const llmModelID = xss(req.body.llmModelID);
        const llmPromptID = xss(req.body.llmPromptID);
        const ragConfigID = xss(req.body.ragConfigID);

        try {
            const isDeploymentAdded = await addDeployment(organisation, apikey, type, llmModelID, llmPromptID, ragConfigID);
            if (isDeploymentAdded) {
                logger.info(`${username} - New ${type} deployment added successfully.`);
                res.status(200).json({ message: "Deployment added successfully" });
            } else if (!isDeploymentAdded) {
                logger.info(`${username} - ${type} deployment could not be added.`);
                res.status(400).json({ error: `${type} deployment could not be added.` });
            }
        } catch (e) {
            console.error(`Error adding new deployment: ${e}`);
            logger.error(`${username} - Error adding new ${type} deployment: ${e}`);
            res.status(500).json({ error: e.toString() });
        }
    }
});

// Route for updating a new deployment
app.post('/updateDeployment', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const type = xss(req.body.type);
    logger.info(`${username} - Updating a ${type} deployment.`);

    if (type === 'llm') {
        const deploymentID = xss(req.body.deploymentID)
        const llmModelID = xss(req.body.llmModelID);
        const llmPromptID = xss(req.body.llmPromptID);
        const ragConfigID = xss(req.body.ragConfigID);

        try {
            const isDeploymentUpdated = await updateDeployment(organisation, apikey, type, deploymentID, llmModelID, llmPromptID, ragConfigID);
            if (isDeploymentUpdated) {
                logger.info(`${username} - New ${type} deployment added successfully.`);
                res.status(200).json({ message: "Deployment added successfully" });
            } else if (!isDeploymentUpdated) {
                logger.info(`${username} - ${type} deployment could not be updated.`);
                res.status(400).json({ error: `${type} deployment could not be updated.` });
            }
        } catch (e) {
            console.error(`Error updating deployment: ${e}`);
            logger.error(`${username} - Error updating ${type} deployment: ${e}`);
            res.status(500).json({ error: e.toString() });
        }
    }
});

// Route for getting deployment details
app.post('/getFullDeploymentDetails', tokenRequired, async (req, res) => {
    const { username, organisation } = req.session;
    const apikey = xss(req.body.apikey);
    const type = xss(req.body.type);
    logger.info(`${username} - Fetching full deployment details.`);

    try {
        const DeploymentDetails = await getDeploymentDetails(organisation, apikey, type);
        logger.info(`${username} - Full deployment details fetched successfully.`);
        res.status(200).json(DeploymentDetails);
    } catch (e) {
        console.error(`Error fetching deployment details: ${e}`);
        logger.error(`${username} - Error fetching full deployment details: ${e}`);
        res.status(500).json({ error: e.toString() });
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});