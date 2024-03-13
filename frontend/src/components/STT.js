import { useState } from 'react';
import Input from "./Input";

export default function STT() {
    // Set up state variables for each form step
    const [addSTTModelState, setAddSTTModelState] = useState({
        APIKey: '',
        modelType: '',
        modelName: ''
    });

    const [updateSTTModelState, setUpdateSTTModelState] = useState({
        APIKey: '',
        ModelID: '',
        modelType: '',
        modelName: '',
        engine: ''
    });

    const [viewSTTModelsState, setViewSTTModelsState] = useState({
        APIKey: ''
    });

    const [addSTTConfigState, setAddSTTConfigState] = useState({
        APIKey: '',
        mode: ''
    });

    const [updateSTTConfigState, setUpdateSTTConfigState] = useState({
        APIKey: '',
        STTID: '',
        mode: ''
    });

    const [viewSTTConfigsState, setViewSTTConfigsState] = useState({
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
    const [Modes, setModes] = useState([]);
    const [ModelTypes, setModelTypes] = useState([]);
    const [ModelNames, setModelNames] = useState([]);
    const [Engines, setEngines] = useState([]);
    const [ModelIDs, setModelIDs] = useState([]);
    const [STTIDs, setSTTIDs] = useState([]);
    const [modelsData, setModelsData] = useState([]);
    const [configsData, setConfigsData] = useState([]);

    // Event handlers for handling form input changes
    const handleChange1 = (e) => {
        setAddSTTModelState({ ...addSTTModelState, [e.target.name]: e.target.value });
        if (e.target.name === "modelType") {
            getModelNames(e.target.value);
        } else if (e.target.name === 'modelName') {
            getEngines_Add(e.target.value);
        }
    };
    const handleChange2 = (e) => {
        const { id, value } = e.target;
        setUpdateSTTModelState({ ...updateSTTModelState, [id]: value });
        if (id === "APIKey") {
            getClientModelIDs(value);
        } else if (id === "modelType") {
            getModelNames(value);
            setUpdateSTTModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
            setUpdateSTTModelState({
                modelName: ''
            })
            setEngines([]);
        } else if (id === 'modelName') {
            setUpdateSTTModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
            getEngines_Update(value);
        } else {
            setUpdateSTTModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        }
    };
    const handleChange3 = (e) => {
        setViewSTTModelsState({ ...viewSTTModelsState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getFullModelDetails(e.target.value);
        }
    }
    const handleChange4 = (e) => setAddSTTConfigState({ ...addSTTConfigState, [e.target.name]: e.target.value });
    const handleChange5 = (e) => {
        setUpdateSTTConfigState({ ...updateSTTConfigState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getClientConfigIDs(e.target.value);
        }
    };
    const handleChange6 = (e) => {
        setViewSTTConfigsState({ ...viewSTTConfigsState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getFullConfigDetails(e.target.value);
        }
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

    // Function to get model IDs
    async function getClientModelIDs(clientApiKey) {
        try {
            const response = await fetch("/stt/getModelIds", {
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
            const response = await fetch("/stt/getConfigIds", {
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
                setSTTIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching config IDs:", error);
        }
    };

    async function getModes() {
        try {
            const response = await fetch("/stt/getModes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setModes(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching modes:", error);
        }
    }

    async function getTranscribeModelsTypes() {
        try {
            const response = await fetch("/stt/getTranscribeModelTypes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setModelTypes(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching modes:", error);
        }
    }

    async function getModelNames(modelType) {
        try {
            const response = await fetch("/stt/getModelNames", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelType: modelType,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setModelNames(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching modes:", error);
        }
    }

    async function getEngines_Add(modelName) {
        try {
            const response = await fetch("/stt/getEngines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelType: addSTTModelState.modelType,
                    modelName: modelName,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setEngines(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching engines:", error);
        }
    }

    async function getEngines_Click(modelType, modelName) {
        try {
            const response = await fetch("/stt/getEngines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelType: modelType,
                    modelName: modelName,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setEngines(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching engines:", error);
        }
    }

    async function getEngines_Update(modelName) {
        try {
            const response = await fetch("/stt/getEngines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelType: updateSTTModelState.modelType,
                    modelName: modelName,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setEngines(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching engines:", error);
        }
    }

    // Function to add new model
    const handleNewModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addSTTModelState.APIKey || !addSTTModelState.modelType || !addSTTModelState.modelName) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected API key, mode and model
        var apikey = addSTTModelState.APIKey;
        var selectedModelType = addSTTModelState.modelType;
        var selectedModelName = addSTTModelState.modelName;

        // Send data to server.js using fetch
        fetch("/stt/addNewModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                modelType: selectedModelType,
                modelName: selectedModelName,
                engine: Engines
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Model ID already exists. Pls try again.", false, 2000);
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
        if (!updateSTTModelState.APIKey || !updateSTTModelState.ModelID || !updateSTTModelState.modelType || !updateSTTModelState.modelName || !updateSTTModelState.engine) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected API key, model ID and model
        var apikey = updateSTTModelState.APIKey;
        var modelid = updateSTTModelState.ModelID;
        var selectedModelType = updateSTTModelState.modelType;
        var selectedModelName = updateSTTModelState.modelName;

        // Send data to server.js using fetch
        fetch("/stt/updateModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                modelid: modelid,
                modelType: selectedModelType,
                modelName: selectedModelName,
                engine: Engines
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
            const response = await fetch("/stt/getFullModelDetails", {
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
    const handleNewConfigButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addSTTConfigState.APIKey || !addSTTConfigState.mode) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected API key, mode and model
        var apikey = addSTTConfigState.APIKey;
        var selectedMode = addSTTConfigState.mode;

        // Send data to server.js using fetch
        fetch("/stt/addNewConfig", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                mode: selectedMode,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Config added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Config ID already exists. Pls try again.", false, 2000);
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
    const handleUpdateConfigButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateSTTConfigState.APIKey || !updateSTTConfigState.STTID || !updateSTTConfigState.mode) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected API key, model ID, mode and model
        var apikey = updateSTTConfigState.APIKey;
        var selectedsttid = updateSTTConfigState.STTID;
        var selectedMode = updateSTTConfigState.mode;

        // Send data to server.js using fetch
        fetch("/stt/updateConfig", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                sttid: selectedsttid,
                mode: selectedMode
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
            const response = await fetch("/stt/getFullConfigDetails", {
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
        setAddSTTModelState({
            APIKey: '',
            modelType: '',
            modelName: ''
        });
        setUpdateSTTModelState({
            APIKey: '',
            ModelID: '',
            modelType: '',
            modelName: '',
            engine: ''
        });
        setViewSTTModelsState({
            APIKey: ''
        });
        setAddSTTConfigState({
            APIKey: '',
            mode: ''
        });
        setUpdateSTTConfigState({
            APIKey: '',
            STTID: '',
            mode: ''
        });
        setViewSTTConfigsState({
            APIKey: ''
        });
        setEngines([]);
    };

    // CSS class for buttons
    const buttonClass = "group relative flex items-center justify-center py-5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

    const submitButtonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-10";

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: '5px'
    };

    const handleSTTModelsButton = () => {
        setMenuNumber(1);
        setDivNumber(3);
        getclientAPIKeys();
        resetForms();
    };

    const handleSTTConfigsButton = () => {
        setMenuNumber(2);
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    const showAddSTTModelForm = () => {
        setDivNumber(1);
        getclientAPIKeys();
        getTranscribeModelsTypes();
        resetForms();
    };

    const viewAllSTTModels = () => {
        setDivNumber(3);
        getclientAPIKeys();
        resetForms();
    };

    const showAddSTTConfigsForm = () => {
        setDivNumber(4);
        getclientAPIKeys();
        getModes();
        resetForms();
    };

    const ViewAllSTTConfigs = () => {
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    // Update the click handler for model IDs
    const handleModelClick = async (APIKey, ModelID, modelType, modelName, engine) => {
        setDivNumber(2);

        await getClientModelIDs(APIKey);
        await getTranscribeModelsTypes();
        await getModelNames(modelType);
        await getEngines_Click(modelType, modelName);

        setUpdateSTTModelState({
            APIKey: APIKey,
            ModelID: ModelID,
            modelType: modelType,
            modelName: modelName,
            engine: engine
        });
    };

    // Update the click handler for config IDs
    const handleConfigClick = async (APIKey, SttID, mode) => {
        setDivNumber(5);

        await getClientConfigIDs(APIKey);

        setUpdateSTTConfigState({
            APIKey: APIKey,
            STTID: SttID,
            mode: mode,
        });
    };


    return (
        <div>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handleSTTModelsButton}
                    className={buttonClass}
                    style={{ width: '220px', height: '40px' }}>
                    Manage Models
                </button>
                <button
                    onClick={handleSTTConfigsButton}
                    className={buttonClass}
                    style={{ width: '220px', height: '40px' }}>
                    Manage Configs
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
                <div id='STTModels' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddSTTModelForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={viewAllSTTModels}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Configs Menu */}
            {menuNumber === 2 && (
                <div id='STTConfigs' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddSTTConfigsForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllSTTConfigs}
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
                            <div className="mb-4">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={addSTTModelState.APIKey}
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
                            <div className="mb-4">
                                <select
                                    id="modelType"
                                    name="modelType"
                                    value={addSTTModelState.modelType}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model Type</option>
                                    {ModelTypes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <select
                                    id="modelName"
                                    name="modelName"
                                    value={addSTTModelState.modelName}
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
                            {addSTTModelState.modelName && Engines[0] !== '' && (
                                <div className="mb-2">
                                    <Input
                                        id="engine"
                                        name="engine"
                                        type="text"
                                        value={Engines}
                                        handleChange={handleChange1}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        isDisabled="true"
                                    />
                                </div>
                            )}
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
                                    value={updateSTTModelState.APIKey}
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
                                    value={updateSTTModelState.ModelID}
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
                            <div className="mb-4">
                                <select
                                    id="modelType"
                                    name="modelType"
                                    value={updateSTTModelState.modelType}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model Type</option>
                                    {ModelTypes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <select
                                    id="modelName"
                                    name="modelName"
                                    value={updateSTTModelState.modelName}
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
                            {updateSTTModelState.modelName && Engines[0] !== '' && (
                                <div className="mb-2">
                                    <Input
                                        id="engine"
                                        name="engine"
                                        type="text"
                                        value={Engines}
                                        onChange={handleChange2}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        isDisabled="true"
                                    />
                                </div>
                            )}
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
                                value={viewSTTModelsState.APIKey}
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

                    {viewSTTModelsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model Type</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model Name</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Engine</th>
                                    </tr>
                                </thead>
                                {/* Table body with models data */}
                                <tbody>
                                    {modelsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        modelsData.map((model, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => handleModelClick(viewSTTModelsState.APIKey, model.modelId, model.modelType, model.modelName, model.engine)}
                                                >
                                                    {model.modelId}
                                                </td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.modelType}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.modelName}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.engine}</td>
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
                                    value={addSTTConfigState.APIKey}
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
                                <select
                                    id="mode"
                                    name="mode"
                                    value={addSTTConfigState.mode}
                                    onChange={handleChange4}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select Mode</option>
                                    {Modes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
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
                                    value={updateSTTConfigState.APIKey}
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
                                    id="STTID"
                                    name="STTID"
                                    value={updateSTTConfigState.STTID}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select STT ID</option>
                                    {STTIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <select
                                    id="mode"
                                    name="mode"
                                    value={updateSTTConfigState.mode}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select Mode</option>
                                    <option value="transcribe">Transcribe</option>
                                    <option value="translate">Translate</option>
                                </select>
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
                                value={viewSTTConfigsState.APIKey}
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

                    {viewSTTConfigsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>STT ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Mode</th>
                                    </tr>
                                </thead>
                                {/* Table body with configs data */}
                                <tbody>
                                    {configsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        configsData.map((config, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => handleConfigClick(viewSTTConfigsState.APIKey, config.sttId, config.mode)}
                                                >
                                                    {config.sttId}
                                                </td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.mode}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}