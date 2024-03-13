const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const yaml = require('js-yaml');

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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - Utility Functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Function to generate a client API key
function generateClientApiKey(length, chunkSize) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let apiKey = '';
    for (let i = 0; i < length; i++) {
        apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Insert hyphens after every chunkSize characters
    const apiKeyWithHyphens = apiKey.match(new RegExp('.{1,' + chunkSize + '}', 'g')).join('-');
    return apiKeyWithHyphens;
}

// Function to add client API keys to the database
async function addClientApiKeys(userid) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const clientApiKeys = db.collection("clientApiKeys");

        let isUniqueKey = false;
        let clientApiKey;

        while (!isUniqueKey) {
            clientApiKey = generateClientApiKey(configData.APIKeyLength, configData.APIChunkLength);
            const existingKey = await clientApiKeys.findOne({ clientApiKey: clientApiKey });
            if (!existingKey) {
                isUniqueKey = true;
            }
        }

        const timestamp = moment.utc().unix();
        const clientApiKeysData = { userid: userid, clientApiKey: clientApiKey, timestamp: timestamp };
        await clientApiKeys.insertOne(clientApiKeysData);
        return true;
    } catch (e) {
        console.error(`Error creating 'clientApiKeys' table: ${e}`);
        return false;
    }
}

// Function to get client API keys based on the user ID
async function getClientApiKeys(userid) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const clientApiKeys = db.collection("clientApiKeys");
        const existingClientApiKeysCursor = clientApiKeys.find({ userid: userid }, { projection: { _id: 0, userid: 0 } });
        const existingClientApiKeys = await existingClientApiKeysCursor.toArray();
        const clientApiKeyList = existingClientApiKeys.map(clientApiKey => clientApiKey.clientApiKey);
        return clientApiKeyList;
    } catch (e) {
        console.error(`Error Fetching 'clientApiKeys': ${e}`);
        return [];
    }
}

// Function to get client API keys data based on the user ID
async function getClientApiKeysData(userid) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const clientApiKeys = db.collection("clientApiKeys");
        const existingClientApiKeysCursor = clientApiKeys.find({ userid: userid }, { projection: { _id: 0, userid: 0 } });
        const existingClientApiKeysData = await existingClientApiKeysCursor.toArray();
        return existingClientApiKeysData;
    } catch (e) {
        console.error(`Error fetching 'clientApiKeys': ${e}`);
        return [];
    }
}

// Function to generate a random ID for various purposes
function generateID(length) {
    let result = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - Organisation Functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Function to add org details to the database
async function addOrg(orgName, orgAddress, dbURI) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const orgDetails = db.collection("orgDetails");

        let isUniqueKey = false;
        let orgID;

        // Check if orgName already exists
        const existingOrg = await orgDetails.findOne({ orgName: orgName });
        if (existingOrg) {
            // orgName already exists, return false
            return false;
        }

        while (!isUniqueKey) {
            orgID = generateID(4);
            const existingKey = await orgDetails.findOne({ orgId: orgID });
            if (!existingKey) {
                isUniqueKey = true;
            }
        }

        const timestamp = moment.utc().unix();
        const orgData = { orgId: orgID, orgName: orgName, orgAddress: orgAddress, dbURI: dbURI, timestamp: timestamp };
        await orgDetails.insertOne(orgData);
        return true;
    } catch (e) {
        console.error(`Error creating 'orgDetails' table: ${e}`);
        return false;
    }
}

async function getOrgIds() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const orgDetails = db.collection("orgDetails");
        const existingOrgIdsCursor = orgDetails.find({}, { projection: { _id: 0, orgName: 0, orgAddress: 0, timestamp: 0 } });
        const existingOrgIds = await existingOrgIdsCursor
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        const orgIds = existingOrgIds.map(org => org.orgId);
        return orgIds;
    } catch (e) {
        console.error(`Error Fetching STT 'ModelIds' table: ${e}`);
    }
}

async function updateOrg(orgId, orgName, orgAddress, dbURI) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const orgDetails = db.collection("orgDetails");
        const timestamp = moment.utc().unix();
        await orgDetails.updateOne(
            { orgId: orgId },
            { $set: { orgName: `${orgName}`, orgAddress: `${orgAddress}`, dbURI: `${dbURI}`, timestamp: timestamp } }
        );
        return true;
    } catch (e) {
        console.error(`Error Updating Org details: ${e}`);
        return false;
    }
}

async function getFullOrgsData() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const orgDetails = db.collection("orgDetails");
        const existingorgDetailsCursor = orgDetails.find({}, { projection: { _id: 0, timestamp: 0 } });
        const existingorgDetailsData = await existingorgDetailsCursor
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return existingorgDetailsData;
    } catch (e) {
        console.error(`Error fetching 'orgDetails': ${e}`);
        return [];
    }
};

async function updateAdmin(username, organisation) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const userDetails = db.collection("userDetails");
        const timestamp = moment.utc().unix();
        await userDetails.updateOne(
            { username: username },
            { $set: { organisation: `${organisation}`, timestamp: timestamp } }
        );
        return true;
    } catch (e) {
        console.error(`Error Updating Admin: ${e}`);
        return false;
    }
}

async function getFullAdminsData() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const userDetails = db.collection("userDetails");
        const existinguserDetailsCursor = userDetails.find({ role: 'admin' }, { projection: { _id: 0, timestamp: 0 } });
        const existinguserDetailsData = await existinguserDetailsCursor
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return existinguserDetailsData;
    } catch (e) {
        console.error(`Error fetching 'userDetails': ${e}`);
        return [];
    }
};

// Function to retrieve deployment IDs for a specific client API key
async function getDeploymentIds(organisation, clientApiKey, type) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deployments = db.collection("deployments");
        const deploymentIdsCursor = deployments.find({ clientApiKey: clientApiKey, type: type }, { projection: { _id: 0, clientApiKey: 0, llmModelId: 0, llmPromptId: 0, ragConfigID: 0 } });
        const existingDeploymentIds = await deploymentIdsCursor.toArray();
        const deploymentIds = existingDeploymentIds.map(deployment => deployment.deploymentId);
        return deploymentIds;
    } catch (e) {
        console.error(`Error Fetching ${type} deployments: ${e}`);
    }
}

async function addDeployment(organisation, apikey, type, llmModelID, llmPromptID, ragConfigID) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deployments = db.collection("deployments");

        let isDeploymentNew = false;
        let deploymentId;

        do {
            deploymentId = generateID(4);
            isDeploymentNew = await deployments.findOne({ deploymentId: deploymentId });
        } while (isDeploymentNew);

        const timestamp = moment.utc().unix();
        if (type === 'llm') {
            const LLMDeploymentData = { clientApiKey: apikey, type: 'llm', deploymentId: deploymentId, llmModelId: llmModelID, llmPromptId: llmPromptID, ragConfigId: ragConfigID, timestamp: timestamp };
            await deployments.insertOne(LLMDeploymentData);
            return true;
        }
    } catch (e) {
        console.error(`Error adding into 'deployments' table: ${e}`);
        return false;
    }
}

async function updateDeployment(organisation, apikey, type, deploymentID, llmModelID, llmPromptID, ragConfigID) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deployments = db.collection("deployments");
        const timestamp = moment.utc().unix();

        if (type === 'llm') {
            await deployments.updateOne(
                { clientApiKey: apikey, type: type, deploymentId: deploymentID },
                { $set: { llmModelId: `${llmModelID}`, llmPromptId: `${llmPromptID}`, ragConfigId: `${ragConfigID}`, timestamp: timestamp } }
            );
            return true;
        }
    } catch (e) {
        console.error(`Error updating deployment: ${e}`);
        return false;
    }
}

// Route for getting deployment details
async function getDeploymentDetails(organisation, clientApiKey, type) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deployments = db.collection("deployments");
        const deploymentDetailsCursor = await deployments.find({ clientApiKey: clientApiKey, type: type }, { projection: { clientApiKey: 0, _id: 0, timestamp: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return deploymentDetailsCursor;
    } catch (e) {
        console.error(`Error fetching deployments Details : ${e}`);
    }
}

module.exports = [addClientApiKeys, getClientApiKeys, getClientApiKeysData, addOrg, getOrgIds, updateOrg, getFullOrgsData, updateAdmin, getFullAdminsData, addDeployment, getDeploymentIds, updateDeployment, getDeploymentDetails];