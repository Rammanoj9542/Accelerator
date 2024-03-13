const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const yaml = require('js-yaml');

// MongoDB connection setup
const uri = getConfigData().db_url;
const client = new MongoClient(uri);

// Function to get configuration data from a YAML file
function getConfigData() {
    const dbPath = path.join(__dirname);
    const configPath = path.join(dbPath, 'config.yaml');
    return yaml.load(fs.readFileSync(configPath, 'utf8'));
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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - LLM Functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Function to get model names 
async function getRAGModelNames() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const modelNameCollection = db.collection("RAGmodelNames");
        const modelNamesCursor = modelNameCollection.find({}, { projection: { _id: 0 } });
        const modelNames = await modelNamesCursor.toArray();
        const modelNameList = modelNames.map(modelName => modelName.modelName);
        return modelNameList;
    } catch (e) {
        console.error(`Error in getRAGModelNames: ${e}`);
        return [];
    }
}

// Function to get device types
async function getRAGDeviceTypes() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const deviceTypesCollection = db.collection("RAGdeviceTypes");
        const deviceTypesCursor = deviceTypesCollection.find({}, { projection: { _id: 0 } });
        const deviceTypes = await deviceTypesCursor.toArray();
        const deviceTypesList = deviceTypes.map(deviceType => deviceType.deviceType);
        return deviceTypesList;
    } catch (e) {
        console.error(`Error in getRAGDeviceTypes: ${e}`);
        return [];
    }
}

// Function to add RAG model to the database
async function getRagModelIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("RAGModels");
        const existingModelIdsCursor = RAGModels.find({ clientApiKey: clientApiKey }, { projection: { _id: 0, clientApiKey: 0, modelName: 0, deviceType: 0 } });
        const existingModelIds = await existingModelIdsCursor.toArray();
        const modelIds = existingModelIds.map(model => model.modelId);
        return modelIds;
    } catch (e) {
        console.error(`Error Fetching RAG 'ModelIds' table: ${e}`);
    }
}

// Function to retrieve RAG configuration IDs for a specific client API key
async function getRagConfigIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGConfigs = db.collection("RAGConfigs");
        const existingConfigIdsCursor = RAGConfigs.find({ clientApiKey: clientApiKey }, { projection: { _id: 0, clientApiKey: 0, chunkSize: 0, chunkOverlap: 0 } });
        const existingConfigIds = await existingConfigIdsCursor.toArray();
        const configIds = existingConfigIds.map(config => config.configId);
        return configIds;
    } catch (e) {
        console.error(`Error Fetching RAG 'ModelIds' table: ${e}`);
    }
}

// Function to add RAG model to the database
async function addRagModel(organisation, clientApiKey, modelName, deviceType) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("RAGModels");

        let isModelIdNew = false;
        let modelId;

        do {
            modelId = generateID(4);
            isModelIdNew = await RAGModels.findOne({ clientApiKey: clientApiKey, modelId: modelId });
        } while (isModelIdNew);

        const timestamp = moment.utc().unix();
        const RAGModelsData = { clientApiKey: clientApiKey, modelId: modelId, modelName: modelName, deviceType: deviceType, timestamp: timestamp };
        await RAGModels.insertOne(RAGModelsData);
        return true;
    } catch (e) {
        console.error(`Error adding into 'RAGModels' table: ${e}`);
        return false;
    }
}

// Function to update an existing RAG model in the database
async function updateRagModel(organisation, clientApiKey, modelId, modelName, deviceType) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("RAGModels");
        const timestamp = moment.utc().unix();
        await RAGModels.updateOne(
            { clientApiKey: clientApiKey, modelId: modelId },
            { $set: { modelName: `${modelName}`, deviceType: `${deviceType}`, timestamp: timestamp } }
        );
        return true;
    } catch (e) {
        console.error(`Error Updating RAG Model : ${e}`);
        return false;
    }
}

// Function to retrieve RAG model details for a specific client API key
async function getRagModelDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("RAGModels");
        const modelDetailsCursor = await RAGModels.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return modelDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Model Details : ${e}`);
    }
}

// Function to add RAG configuration to the database
async function addRagConfig(organisation, clientApiKey, size, overlap, path) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGConfigs = db.collection("RAGConfigs");

        let isConfigNew = false;
        let configId;

        do {
            configId = generateID(4);
            isConfigNew = await RAGConfigs.findOne({ clientApiKey: clientApiKey, configId: configId });
        } while (isConfigNew);

        const timestamp = moment.utc().unix();
        const RAGConfigsData = { clientApiKey: clientApiKey, configId: configId, chunkSize: size, chunkOverlap: overlap, path: path, timestamp: timestamp };
        await RAGConfigs.insertOne(RAGConfigsData);
        return true;
    } catch (e) {
        console.error(`Error adding into 'RAGModels' table: ${e}`);
        return false;
    }
}

// Function to update an existing RAG configuration in the database
async function updateRagConfig(organisation, clientApiKey, configId, size, overlap, path) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGConfigs = db.collection("RAGConfigs");
        const timestamp = moment.utc().unix();
        await RAGConfigs.updateOne(
            { clientApiKey: clientApiKey, configId: configId },
            { $set: { chunkSize: `${size}`, chunkOverlap: `${overlap}`, path: `${path}`, timestamp: timestamp } }
        );
        return true;
    } catch (e) {
        console.error(`Error Updating RAG Config : ${e}`);
        return false;
    }
}

// Function to retrieve RAG configuration details for a specific client API key
async function getRagConfigDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGConfigs = db.collection("RAGConfigs");
        const configDetailsCursor = await RAGConfigs.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return configDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Config Details : ${e}`);
    }
}

module.exports = [getRAGModelNames, getRAGDeviceTypes, getRagModelIds, addRagModel, updateRagModel, getRagModelDetails, addRagConfig, getRagConfigIds, updateRagConfig, getRagConfigDetails];