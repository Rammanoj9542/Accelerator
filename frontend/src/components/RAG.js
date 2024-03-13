import { useState } from 'react';
import Input from "./Input";
import configData from "../constants/config.json";

export default function RAG() {
    // Set up state variables for each form step
    const [addRAGModelState, setAddRAGModelState] = useState({
        APIKey: '',
        modelName: '',
        deviceType: ''
    });

    const [updateRAGModelState, setUpdateRAGModelState] = useState({
        APIKey: '',
        ModelID: '',
        modelName: '',
        deviceType: ''
    });

    const [viewRAGModelsState, setViewRAGModelsState] = useState({
        APIKey: ''
    });

    const [addRAGConfigState, setAddRAGConfigState] = useState({
        APIKey: '',
        chunkSize: '',
        chunkOverlap: '',
        path: ''
    });

    const [updateRAGConfigState, setUpdateRAGConfigState] = useState({
        APIKey: '',
        configId: '',
        chunkSize: '',
        chunkOverlap: '',
        path: ''
    });

    const [viewRAGConfigsState, setViewRAGConfigsState] = useState({
        APIKey: ''
    });

    // State to control flash messages
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    const [divNumber, setDivNumber] = useState(0); // State to track the form number
    const [menuNumber, setMenuNumber] = useState(0); // State to track the menu/options number

    const [APIKeys, setAPIKeys] = useState([]);
    const [ModelNames, setModelNames] = useState([]);
    const [DeviceTypes, setDeviceTypes] = useState([]);
    const [ModelIDs, setModelIDs] = useState([]);
    const [configIDs, setConfigIDs] = useState([]);
    const [modelsData, setModelsData] = useState([]);
    const [configsData, setConfigsData] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState(null);

    const [text, setText] = useState('Ingest');
    const [loading, setLoading] = useState(false);

    // Event handlers for handling form input changes
    const handleChange1 = (e) => setAddRAGModelState({ ...addRAGModelState, [e.target.name]: e.target.value });
    const handleChange2 = (e) => {
        setUpdateRAGModelState({ ...updateRAGModelState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getClientModelIDs(e.target.value);
        }
    };
    const handleChange3 = (e) => {
        setViewRAGModelsState({ ...viewRAGModelsState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getFullModelDetails(e.target.value);
        }
    }
    const handleChange4 = (e) => {
        setAddRAGConfigState({ ...addRAGConfigState, [e.target.name]: e.target.value });
    };
    const handleChange5 = (e) => {
        setUpdateRAGConfigState({ ...updateRAGConfigState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getClientConfigIDs(e.target.value);
        }
    };
    const handleChange6 = (e) => {
        setViewRAGConfigsState({ ...viewRAGConfigsState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getFullConfigDetails(e.target.value);
        }
    };
    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    // Function to handle flash messages
    const handleFlashMessage = (text, success, time) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), time);
    };

    // Function to get API Keys
    async function getclientAPIKeys() {
        try {
            const response = await fetch("/clientApiKeys", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAPIKeys(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching keys:", error);
        }
    }

    async function getModelNames() {
        try {
            const response = await fetch("/rag/getModelNames", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                const data = await response.json();
                setModelNames(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model names:", error);
        }
    }

    async function getDeviceTypes() {
        try {
            const response = await fetch("/rag/getDeviceTypes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDeviceTypes(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching device types:", error);
        }
    }

    // Function to get model IDs
    async function getClientModelIDs(clientApiKey) {
        try {
            const response = await fetch("/rag/getModelIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setModelIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model IDs:", error);
        }
    };

    // Function to get config IDs
    async function getClientConfigIDs(clientApiKey) {
        try {
            const response = await fetch("/rag/getConfigIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setConfigIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching config IDs:", error);
        }
    };

    // Function to add new model
    const handleNewModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addRAGModelState.APIKey || !addRAGModelState.modelName || !addRAGModelState.deviceType) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected API key, model name and device type
        var apikey = addRAGModelState.APIKey;
        var selectedModelName = addRAGModelState.modelName;
        var selectedDeviceType = addRAGModelState.deviceType;

        // Send data to server.js using fetch
        fetch("/rag/addNewModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                modelName: selectedModelName,
                deviceType: selectedDeviceType
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Could not add model. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding key and model id:", error);
            })
            .finally(() => {
                resetForms();
            });
    }

    // Function to update existing model
    const handleUpdateModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateRAGModelState.APIKey || !updateRAGModelState.ModelID || !updateRAGModelState.modelName || !updateRAGModelState.deviceType) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected API key, model ID, model name and device type
        var apikey = updateRAGModelState.APIKey;
        var modelid = updateRAGModelState.ModelID;
        var selectedModelName = updateRAGModelState.modelName;
        var selectedDeviceType = updateRAGModelState.deviceType;

        // Send data to server.js using fetch
        fetch("/rag/updateModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                modelid: modelid,
                modelName: selectedModelName,
                deviceType: selectedDeviceType
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model updated successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Model couldnt be updated. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating model:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(3);
            });
    }

    // Function to get all models data
    async function getFullModelDetails(clientApiKey) {
        try {
            const response = await fetch("/rag/getFullModelDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setModelsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model details:", error);
        }
    };

    // Function to add new config
    const handleNewConfigButton = async (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addRAGConfigState.APIKey || !addRAGConfigState.chunkSize || !addRAGConfigState.chunkOverlap || !addRAGConfigState.path) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        const validatedPath = await validatePath(addRAGConfigState.path);

        // Retrieve selected API key, chunk size and overlap
        var apikey = addRAGConfigState.APIKey;
        var enteredSize = addRAGConfigState.chunkSize;
        var enteredOverlap = addRAGConfigState.chunkOverlap;
        var enteredPath = validatedPath;

        // Send data to server.js using fetch
        fetch("/rag/addNewConfig", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                chunkSize: enteredSize,
                chunkOverlap: enteredOverlap,
                path: enteredPath
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Config added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Config couldnt be added. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding config:", error);
            })
            .finally(() => {
                resetForms();
            });
    }

    // Function to update existing config
    const handleUpdateConfigButton = async (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateRAGConfigState.APIKey || !updateRAGConfigState.configId || !updateRAGConfigState.chunkSize || !updateRAGConfigState.chunkOverlap || !updateRAGConfigState.path) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        const validatedPath = await validatePath(updateRAGConfigState.path);

        // Retrieve selected API key, config ID, chunk size and overlap
        var apikey = updateRAGConfigState.APIKey;
        var selectedConfigId = updateRAGConfigState.configId;
        var enteredSize = updateRAGConfigState.chunkSize;
        var enteredOverlap = updateRAGConfigState.chunkOverlap;
        var enteredPath = validatedPath;

        // Send data to server.js using fetch
        fetch("/rag/updateConfig", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                configId: selectedConfigId,
                size: enteredSize,
                overlap: enteredOverlap,
                path: enteredPath
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Config updated successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Config couldnt be updated. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating Config:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(6);
            });
    }

    // Function to get all configs data
    async function getFullConfigDetails(clientApiKey) {
        try {
            const response = await fetch("/rag/getFullConfigDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setConfigsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching config details:", error);
        }
    };

    // Function to reset the forms to its initial state
    const resetForms = () => {
        setAddRAGModelState({
            APIKey: '',
            modelName: '',
            deviceType: ''
        });
        setUpdateRAGModelState({
            APIKey: '',
            ModelID: '',
            modelName: '',
            deviceType: ''
        });
        setViewRAGModelsState({
            APIKey: ''
        });
        setAddRAGConfigState({
            APIKey: '',
            chunkSize: '',
            chunkOverlap: '',
            path: ''
        });
        setUpdateRAGConfigState({
            APIKey: '',
            configId: '',
            chunkSize: '',
            chunkOverlap: '',
            path: ''
        });
        setViewRAGConfigsState({
            APIKey: ''
        });
        setSelectedFiles(null);
    };

    // CSS class for buttons
    const buttonClass = "group relative flex items-center justify-center py-5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

    const submitButtonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-10";

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: '5px'
    };

    const handleRAGModelsButton = () => {
        setMenuNumber(1);
        setDivNumber(3);
        getclientAPIKeys();
        getModelNames();
        getDeviceTypes();
        resetForms();
    };

    const handleRAGConfigsButton = () => {
        setMenuNumber(2);
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    const handleIngestButton = () => {
        setMenuNumber(0);
        setDivNumber(7);
    }

    const showAddRAGModelForm = () => {
        setDivNumber(1);
        getclientAPIKeys();
        resetForms();
    };

    const viewAllRAGModels = () => {
        setDivNumber(3);
        getclientAPIKeys();
        resetForms();
    };

    const showAddRAGConfigsForm = () => {
        setDivNumber(4);
        getclientAPIKeys();
        resetForms();
    };

    const ViewAllRAGConfigs = () => {
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    // Update the click handler for model IDs
    const handleModelClick = async (APIKey, ModelID, modelName, deviceType) => {
        setDivNumber(2);

        await getClientModelIDs(APIKey);

        setUpdateRAGModelState({
            APIKey: APIKey,
            ModelID: ModelID,
            modelName: modelName,
            deviceType: deviceType
        });
    };

    // Update the click handler for config IDs
    const handleConfigClick = async (APIKey, configId, size, overlap, path) => {
        setDivNumber(5);

        await getClientConfigIDs(APIKey);

        setUpdateRAGConfigState({
            APIKey: APIKey,
            configId: configId,
            chunkSize: size,
            chunkOverlap: overlap,
            path: path
        });
    };

    const validatePath = (path) => {
        let updatedPath = path;

        updatedPath = updatedPath.replace(/[^A-Za-z0-9/]/g, ''); // Remove all characters other than letters, numbers, and forward slashes
        updatedPath = updatedPath.replace(/\/\/+/g, '/'); // Remove consecutive forward slashes
        if (updatedPath[0] === "/") {
            updatedPath = updatedPath.slice(1);
        }
        if (updatedPath[updatedPath.length - 1] === "/") {
            updatedPath = updatedPath.slice(0, -1);
        }
        updatedPath = updatedPath.toLowerCase();

        return updatedPath;
    };

    const handleFileUploadAndIngest = async () => {
        if (selectedFiles && selectedFiles.length > 0) {
            setText("Uploading Files...");
            setLoading(true);

            const formData = new FormData();

            // Append each file to FormData
            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('files', selectedFiles[i]);
            }

            try {
                // Step 1 - File(s) Upload
                const response = await fetch('/rag/uploadFiles', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    resetForms();

                    // Clear the file input field value
                    const fileInput = document.getElementById('fileInput');
                    if (fileInput) {
                        fileInput.value = '';
                    }

                    // Calling for step 2
                    handleFileIngest();
                } else {
                    console.error('Files upload failed.');
                    handleFlashMessage("Files uploaded failed. Please try again", false, 3000);
                }
            } catch (error) {
                console.error('Error uploading files:', error);
                handleFlashMessage(`Error uploading files: ${error}`, false, 3000);
            }
        } else {
            console.warn('No files selected');
            handleFlashMessage("No files selected", false, 2000);
        }
    };

    const handleFileIngest = async () => {
        setText("Ingesting Files...");

        try {
            // Step 2 - File(s) Ingest
            const response = await fetch('/rag/ingestFiles', {
                method: 'POST'
            });

            if (response.ok) {

                // Calling for step 3
                if (configData.RAG_Archive) {
                    handleFileMove();
                } else {
                    await handleFileDelete();
                    handleFlashMessage("File ingest successful!", true, 3000);
                }
            } else {
                console.error('File ingest failed.');
                handleFlashMessage("File ingest failed. Please try again", false, 3000);
            }
        } catch (error) {
            console.error('Error ingesting files:', error);
            handleFlashMessage(`Error ingesting files: ${error}`, false, 3000);
        }
    };

    const handleFileMove = async () => {
        setText("Archiving Files...");

        try {
            // Step 3 - File(s) Moving to archive
            const response = await fetch('/rag/moveFiles', {
                method: 'POST'
            });

            if (response.ok) {
                handleFlashMessage("File ingest successful!", true, 3000);
            } else {
                console.error('File moving failed.');
                handleFlashMessage("File moving failed. Please try again", false, 3000);
            }
        } catch (error) {
            console.error('Error moving files:', error);
            handleFlashMessage(`Error moving files: ${error}`, false, 3000);
        } finally {
            setText("Ingest");
            setLoading(false);
        }
    };

    const handleFileDelete = async () => {
        setText("Deleting Files...");

        try {
            // Step 3 - File(s) Moving to archive
            const response = await fetch('/rag/deleteFiles', {
                method: 'POST'
            });

            if (response.ok) {
                handleFlashMessage("File ingest successful!", true, 3000);
            } else {
                console.error('File deletion failed.');
                handleFlashMessage("File deletion failed. Please try again", false, 3000);
            }
        } catch (error) {
            console.error('Error deleting files:', error);
            handleFlashMessage(`Error deleting files: ${error}`, false, 3000);
        } finally {
            setText("Ingest");
            setLoading(false);
        }
    };


    return (
        <div>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handleRAGModelsButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Manage Models
                </button>
                <button
                    onClick={handleRAGConfigsButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Manage Configs
                </button>
                <button
                    onClick={handleIngestButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Ingest Files
                </button>
            </div>

            {/* Displaying success flash message */}
            {flashMessage.success && (
                <div id="successFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            {/* Displaying failure flash message */}
            {flashMessage.failure && (
                <div id="failFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            {/* Models Menu */}
            {menuNumber === 1 && (
                <div id='RAGModels' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddRAGModelForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button >
                    <button
                        onClick={viewAllRAGModels}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Configs Menu */}
            {menuNumber === 2 && (
                <div id='RAGConfigs' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddRAGConfigsForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllRAGConfigs}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* New Model div */}
            {divNumber === 1 && (
                <div>
                    <h1 style={h1Style}>Add New Model</h1>

                    <form className="mt-6 space-y-6">
                        <div className="">
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={addRAGModelState.APIKey}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="modelName"
                                    name="modelName"
                                    value={addRAGModelState.modelName}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model Name</option>
                                    {ModelNames.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="deviceType"
                                    name="deviceType"
                                    value={addRAGModelState.deviceType}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Device Type</option>
                                    {DeviceTypes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button className={submitButtonClass} onClick={handleNewModelButton}>Add</button>
                    </form>
                </div>
            )}

            {/* Update Existing Model div */}
            {divNumber === 2 && (
                <div>
                    <h1 style={h1Style}>Update Existing Model</h1>

                    <form className="mt-6 space-y-6">
                        <div className="">
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={updateRAGModelState.APIKey}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <select
                                    id="ModelID"
                                    name="ModelID"
                                    value={updateRAGModelState.ModelID}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select Model ID</option>
                                    {ModelIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="modelName"
                                    name="modelName"
                                    value={updateRAGModelState.modelName}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model Name</option>
                                    {ModelNames.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="deviceType"
                                    name="deviceType"
                                    value={updateRAGModelState.deviceType}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Device Type</option>
                                    {DeviceTypes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button className={submitButtonClass} onClick={handleUpdateModelButton}>Update</button>
                    </form>
                </div>
            )}

            {/* View All Models div */}
            {divNumber === 3 && (
                <div>
                    <h1 style={h1Style}>All Models</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-4">
                            <select
                                id="APIKey"
                                name="APIKey"
                                value={viewRAGModelsState.APIKey}
                                onChange={handleChange3}
                                className="mt-1 p-2 border rounded-md w-full"
                                required>
                                <option value="">Select API Key</option>
                                {APIKeys.map((data) => (
                                    <option key={data} value={data}>
                                        {data}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>

                    {viewRAGModelsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model Name</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Device Type</th>
                                    </tr>
                                </thead>
                                {/* Table body with models data */}
                                <tbody>
                                    {modelsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        modelsData.map((model, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => handleModelClick(viewRAGModelsState.APIKey, model.modelId, model.modelName, model.deviceType)}
                                                >
                                                    {model.modelId}
                                                </td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.modelName}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.deviceType}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* New Config div */}
            {divNumber === 4 && (
                <div>
                    <h1 style={h1Style}>Add New Config</h1>

                    <form className="mt-6 space-y-6">
                        <div className="">
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={addRAGConfigState.APIKey}
                                    onChange={handleChange4}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <Input
                                    id="chunkSize"
                                    name="chunkSize"
                                    key="chunkSize"
                                    handleChange={handleChange4}
                                    value={addRAGConfigState.chunkSize}
                                    type="number"
                                    isRequired="true"
                                    placeholder="Enter Chunk Size"
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    id="chunkOverlap"
                                    name="chunkOverlap"
                                    key="chunkOverlap"
                                    handleChange={handleChange4}
                                    value={addRAGConfigState.chunkOverlap}
                                    type="number"
                                    isRequired="true"
                                    placeholder="Enter Chunk Overlap"
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    id="path"
                                    name="path"
                                    key="path"
                                    handleChange={handleChange4}
                                    value={addRAGConfigState.path}
                                    type="text"
                                    isRequired="true"
                                    placeholder="Enter Config Path"
                                />
                            </div>
                        </div>
                        <button className={submitButtonClass} onClick={handleNewConfigButton}>Add</button>
                    </form>
                </div>
            )}

            {/* Update Existing Config div */}
            {divNumber === 5 && (
                <div>
                    <h1 style={h1Style}>Update Existing Config</h1>

                    <form className="mt-6 space-y-6">
                        <div className="">
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={updateRAGConfigState.APIKey}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <select
                                    id="configId"
                                    name="configId"
                                    value={updateRAGConfigState.configId}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select Config ID</option>
                                    {configIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <Input
                                    id="chunkSize"
                                    name="chunkSize"
                                    key="chunkSize"
                                    handleChange={handleChange5}
                                    value={updateRAGConfigState.chunkSize}
                                    type="number"
                                    isRequired="true"
                                    placeholder="Enter the Chunk Size"
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    id="chunkOverlap"
                                    name="chunkOverlap"
                                    key="chunkOverlap"
                                    handleChange={handleChange5}
                                    value={updateRAGConfigState.chunkOverlap}
                                    type="number"
                                    isRequired="true"
                                    placeholder="Enter Chunk Overlap"
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    id="path"
                                    name="path"
                                    key="path"
                                    handleChange={handleChange5}
                                    value={updateRAGConfigState.path}
                                    type="text"
                                    isRequired="true"
                                    placeholder="Enter Config Path"
                                />
                            </div>
                        </div>
                        <button className={submitButtonClass} onClick={handleUpdateConfigButton}>Update</button>
                    </form>
                </div>
            )}

            {/* View All Configs div */}
            {divNumber === 6 && (
                <div>
                    <h1 style={h1Style}>All Configs</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-4">
                            <select
                                id="APIKey"
                                name="APIKey"
                                value={viewRAGConfigsState.APIKey}
                                onChange={handleChange6}
                                className="mt-1 p-2 border rounded-md w-full"
                                required>
                                <option value="">Select API Key</option>
                                {APIKeys.map((data) => (
                                    <option key={data} value={data}>
                                        {data}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>

                    {viewRAGConfigsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Config ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Chunk Size</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Chunk Overlap</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Path</th>
                                    </tr>
                                </thead>
                                {/* Table body with configs data */}
                                <tbody>
                                    {configsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        configsData.map((config, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => handleConfigClick(viewRAGConfigsState.APIKey, config.configId, config.chunkSize, config.chunkOverlap, config.path)}
                                                >
                                                    {config.configId}
                                                </td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.chunkSize}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.chunkOverlap}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.path}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Ingest files div */}
            {divNumber === 7 && (
                <div>
                    <h1 style={h1Style}>Ingest Files</h1>

                    <Input
                        id="fileInput"
                        name="fileInput"
                        type="file"
                        handleChange={handleFileChange}
                        isRequired={true}
                        multiple={true}
                        isDisabled={loading}
                    />

                    <button
                        className={`${submitButtonClass} ${loading ? 'disabledButton' : ''}`}
                        style={{
                            ...(loading && {
                                backgroundColor: '#ccc', // Set grey background when disabled
                                color: '#666', // Set darker text color when disabled
                            })
                        }}
                        onClick={handleFileUploadAndIngest}
                        disabled={loading}
                    >
                        {text}
                    </button>
                </div>
            )}

        </div >
    )
}