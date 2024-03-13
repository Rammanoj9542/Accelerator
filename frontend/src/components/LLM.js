import { useState } from 'react';
import Input from "./Input";

export default function LLM() {
    // Set up state variables for each form step
    const [addLLMModelState, setAddLLMModelState] = useState({
        APIKey: '',
        mode: '',
        model: '',
        modelName: '',
        cloudAPIKey: ''
    });

    const [updateLLMModelState, setUpdateLLMModelState] = useState({
        APIKey: '',
        ModelID: '',
        mode: '',
        model: '',
        modelName: '',
        engine: '',
        cloudAPIKey: ''
    });

    const [viewLLMModelsState, setViewLLMModelsState] = useState({
        APIKey: ''
    });

    const [addLLMPromptState, setAddLLMPromptState] = useState({
        APIKey: '',

        appType: '',
        memoryType: '',
        kValue: '',
        tokenLimit: '',

        promptType: '',
        simplePrompt: '',
        systemMessage: '',
        aiMessage: '',
        humanMessage: ''
    });

    const [updateLLMPromptState, setUpdateLLMPromptState] = useState({
        APIKey: '',
        promptId: '',

        appType: '',
        memoryType: '',
        kValue: '',
        tokenLimit: '',

        promptType: '',
        simplePrompt: '',
        systemMessage: '',
        aiMessage: '',
        humanMessage: ''
    });

    const [viewLLMPromptsState, setViewLLMPromptsState] = useState({
        APIKey: ''
    });

    const [addLLMDeploymentState, setAddLLMDeploymentState] = useState({
        APIKey: '',
        LLMModelID: '',
        LLMpromptId: '',
        RAGconfigID: ''
    });

    const [updateLLMDeploymentState, setUpdateLLMDeploymentState] = useState({
        APIKey: '',
        deploymentId: '',
        LLMModelID: '',
        LLMpromptId: '',
        RAGconfigID: ''
    });

    const [viewLLMDeploymentsState, setViewLLMDeploymentsState] = useState({
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
    const [Models, setModels] = useState([]);
    const [ModelNames, setModelNames] = useState([]);
    const [Engines, setEngines] = useState([]);
    const [ModelIDs, setModelIDs] = useState([]);
    const [modelsData, setModelsData] = useState([]);
    const [PromptIDs, setPromptIDs] = useState([]);
    const [promptsData, setPromptsData] = useState([]);
    const [deploymentsData, setDeploymentsData] = useState([]);

    const [RAGconfigIDs, setRAGConfigIDs] = useState([]);
    const [deploymentIDs, setDeploymentIDs] = useState([]);

    const [numFields, setNumFields] = useState(1); // State to keep track of the number of fields
    const [fieldsData, setFieldsData] = useState([]); // State to store key-value pairs

    // Event handlers for handling form input changes
    const handleChange1 = (e) => {
        const { id, value } = e.target;
        if (id === 'mode') {
            getModels(value);
            setAddLLMModelState((prevState) => ({
                ...prevState,
                [id]: value,
                modelName: ''
            }));
        } else if (id === 'model') {
            getModelNames(value);
            setAddLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        } else if (id === 'modelName') {
            getEngines(value);
            setAddLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        } else {
            setAddLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        }
    };
    const handleChange2 = (e) => {
        const { id, value } = e.target;
        setUpdateLLMModelState({ ...updateLLMModelState, [id]: value });
        if (id === "APIKey") {
            getLLMClientModelIDs(value);
        } else if (id === 'mode') {
            getModels(value);
            setUpdateLLMModelState((prevState) => ({
                ...prevState,
                [id]: value,
                modelName: '',
                engine: ''
            }));
        } else if (id === 'model') {
            getModelNames(value);
            setUpdateLLMModelState((prevState) => ({
                ...prevState,
                [id]: value,
                engine: ''
            }));
        } else if (id === 'modelName') {
            getEngines(value);
            setUpdateLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        } else {
            setUpdateLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        }
    };
    const handleChange3 = (e) => {
        const { id, value } = e.target;
        setViewLLMModelsState({ ...viewLLMModelsState, [id]: value });
        if (id === "APIKey") {
            getFullModelDetails(value);
        }
    }
    const handleChange4 = (e) => {
        const { id, value } = e.target;
        if (id === "kValue") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            if (parseInt(onlyNums) < 1 || parseInt(onlyNums) > 100) {
                handleFlashMessage("Max k value limit is 100", false, 1000);
                return;
            }
            setAddLLMPromptState({ ...addLLMPromptState, [id]: onlyNums });
        } else if (id === "tokenLimit") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            if (parseInt(onlyNums) < 1 || parseInt(onlyNums) > 5000) {
                handleFlashMessage("Max token limit is 1000", false, 1000);
                return;
            }
            setAddLLMPromptState({ ...addLLMPromptState, [id]: onlyNums });
        } else {
            setAddLLMPromptState({ ...addLLMPromptState, [id]: value });
        }
    };
    const handleChange5 = (e) => {
        const { id, value } = e.target;
        setUpdateLLMPromptState({ ...updateLLMPromptState, [id]: value });
        if (id === "APIKey") {
            getLLMClientPromptIDs(value);
        } else if (id === "kValue") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            if (parseInt(onlyNums) < 1 || parseInt(onlyNums) > 100) {
                handleFlashMessage("Max k value limit is 100", false, 1000);
                return;
            }
            setUpdateLLMPromptState({ ...updateLLMPromptState, [id]: onlyNums });
        } else if (id === "tokenLimit") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            if (parseInt(onlyNums) < 1 || parseInt(onlyNums) > 5000) {
                handleFlashMessage("Max token limit is 1000", false, 1000);
                return;
            }
            setUpdateLLMPromptState({ ...updateLLMPromptState, [id]: onlyNums });
        } else {
            setUpdateLLMPromptState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        }
    };
    const handleChange6 = (e) => {
        const { id, value } = e.target;
        setViewLLMPromptsState({ ...viewLLMPromptsState, [id]: value });
        if (id === "APIKey") {
            getFullPromptsData(value);
        }
    };
    const handleChangeKeyValue = (event, index, field) => {
        const { value } = event.target;
        setFieldsData((prevFieldsData) => {
            const updatedFieldsData = { ...prevFieldsData };
            if (!updatedFieldsData[index]) {
                updatedFieldsData[index] = {};
            }
            updatedFieldsData[index][field] = value;
            return updatedFieldsData;
        });
    };
    const handleChange7 = (e) => {
        const { id, value } = e.target;
        setAddLLMDeploymentState({ ...addLLMDeploymentState, [id]: value });
        if (id === "APIKey") {
            getLLMClientModelIDs(value);
            getLLMClientPromptIDs(value);
            getRAGClientConfigIDs(value);
        }
    };
    const handleChange8 = (e) => {
        setUpdateLLMDeploymentState({ ...updateLLMDeploymentState, [e.target.name]: e.target.value });
        if (e.target.name === "APIKey") {
            getDeploymentIDs(e.target.value);
        }
    };
    const handleChange9 = (e) => {
        const { id, value } = e.target;
        setViewLLMDeploymentsState({ ...viewLLMDeploymentsState, [id]: value });
        if (id === "APIKey") {
            getDeploymentDetails(value);
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

    async function getModes() {
        try {
            const response = await fetch("/llm/getModes", {
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

    async function getModels(mode) {
        try {
            const response = await fetch("/llm/getModels", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mode: mode,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setModels(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching modes:", error);
        }
    }

    async function getModelNames(model) {
        try {
            const response = await fetch("/llm/getModelNames", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
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

    async function getEngines(modelName) {
        try {
            const response = await fetch("/llm/getEngines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
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

    // Function to get model IDs
    async function getLLMClientModelIDs(clientApiKey) {
        try {
            const response = await fetch("/llm/getModelIds", {
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

    // Function to get prompt IDs
    async function getLLMClientPromptIDs(clientApiKey) {
        try {
            const response = await fetch("/llm/getPromptIds", {
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
                setPromptIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching prompt IDs:", error);
        }
    };

    // Function to get deployment IDs
    async function getDeploymentIDs(clientApiKey) {
        try {
            const response = await fetch("/getDeploymentIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    type: 'llm'
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setDeploymentIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching deployment IDs:", error);
        }
    }

    // Function to add new model
    const handleNewModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addLLMModelState.APIKey || !addLLMModelState.mode || !addLLMModelState.model || !addLLMModelState.modelName) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Check if cloud API key is entered in cloud ode
        if (addLLMModelState.mode === "Cloud" && !addLLMModelState.cloudAPIKey) {
            handleFlashMessage("Please enter the Cloud API Key.", false, 2000);
            return;
        }

        // Retrieve selected API key, mode, model and model name
        var apikey = addLLMModelState.APIKey;
        var selectedMode = addLLMModelState.mode;
        var selectedModel = addLLMModelState.model;
        var selectedModelName = addLLMModelState.modelName;
        var enteredCloudAPIKey = addLLMModelState.cloudAPIKey;

        // Send data to server.js using fetch
        fetch("/llm/addNewModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                mode: selectedMode,
                model: selectedModel,
                modelName: selectedModelName,
                engine: Engines,
                cloudAPIKey: enteredCloudAPIKey
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding model:", error);
            })
            .finally(() => {
                resetForms();
            });
    }

    // Function to update existing model
    const handleUpdateModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateLLMModelState.APIKey || !updateLLMModelState.ModelID || !updateLLMModelState.mode || !updateLLMModelState.model || !updateLLMModelState.modelName) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Check if cloud API key is entered in cloud ode
        if (updateLLMModelState.mode === "Cloud" && !updateLLMModelState.cloudAPIKey) {
            handleFlashMessage("Please enter the Cloud API Key.", false, 2000);
            return;
        }

        // Retrieve selected API key, model ID and model
        var apikey = updateLLMModelState.APIKey;
        var modelid = updateLLMModelState.ModelID;
        var selectedMode = updateLLMModelState.mode;
        var selectedModel = updateLLMModelState.model;
        var selectedModelName = updateLLMModelState.modelName;
        var enteredCloudAPIKey = updateLLMModelState.cloudAPIKey;

        // Send data to server.js using fetch
        fetch("/llm/updateModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                modelid: modelid,
                mode: selectedMode,
                model: selectedModel,
                modelName: selectedModelName,
                engine: Engines,
                cloudAPIKey: enteredCloudAPIKey
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model updated successfully", true, 2000);
                    resetForms();
                } else if (response.status === 400) {
                    resetForms();
                    handleFlashMessage("Model couldnt be updated. Pls try again.", false, 2000);
                } else {
                    resetForms();
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
            const response = await fetch("/llm/getFullModelDetails", {
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

    const handleNewPromptButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addLLMPromptState.APIKey || !addLLMPromptState.appType || !addLLMPromptState.promptType) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        const formattedFieldsData = {};
        Object.keys(fieldsData).forEach((index) => {
            const key = fieldsData[index].key;
            const value = fieldsData[index].value;
            formattedFieldsData[key] = value;
        });

        // Retrieve all the form data
        var apikey = addLLMPromptState.APIKey;

        var selectedAppType = addLLMPromptState.appType;
        var selectedMemoryType = addLLMPromptState.memoryType;
        var enteredkValue = addLLMPromptState.kValue;
        var enteredTokenLimit = addLLMPromptState.tokenLimit;

        var selectedPromptType = addLLMPromptState.promptType;
        var enteredsimplePrompt = addLLMPromptState.simplePrompt;
        var enteredsystemMessage = addLLMPromptState.systemMessage;
        var enteredaiMessage = addLLMPromptState.aiMessage;
        var enteredhumanMessage = addLLMPromptState.humanMessage;

        var formattedInputData = formattedFieldsData;

        fetch("/llm/addPrompt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clientApiKey: apikey,
                promptId: '',

                appType: selectedAppType,
                memoryType: selectedMemoryType,
                kValue: enteredkValue,
                tokenLimit: enteredTokenLimit,

                promptType: selectedPromptType,
                simplePrompt: enteredsimplePrompt,
                systemMessage: enteredsystemMessage,
                aiMessage: enteredaiMessage,
                humanMessage: enteredhumanMessage,

                inputData: formattedInputData
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Prompt added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Prompt ID already exists. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding prompt:", error);
            })
            .finally(() => {
                resetForms();
            });
    }

    const handleUpdatePromptButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateLLMPromptState.APIKey || !updateLLMPromptState.promptId) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        const formattedFieldsData = {};
        Object.keys(fieldsData).forEach((index) => {
            const key = fieldsData[index].key;
            const value = fieldsData[index].value;
            formattedFieldsData[key] = value;
        });

        // Retrieve all the form data
        var apikey = updateLLMPromptState.APIKey;
        var promptID = updateLLMPromptState.promptId;

        var selectedAppType = updateLLMPromptState.appType;
        var selectedMemoryType = updateLLMPromptState.memoryType;
        var enteredkValue = updateLLMPromptState.kValue;
        var enteredTokenLimit = updateLLMPromptState.tokenLimit;

        var selectedPromptType = updateLLMPromptState.promptType;
        var enteredsimplePrompt = updateLLMPromptState.simplePrompt;
        var enteredsystemMessage = updateLLMPromptState.systemMessage;
        var enteredaiMessage = updateLLMPromptState.aiMessage;
        var enteredhumanMessage = updateLLMPromptState.humanMessage;

        var formattedInputData = formattedFieldsData;

        fetch("/llm/updatePrompt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clientApiKey: apikey,
                promptId: promptID,

                appType: selectedAppType,
                memoryType: selectedMemoryType,
                kValue: enteredkValue,
                tokenLimit: enteredTokenLimit,

                promptType: selectedPromptType,
                simplePrompt: enteredsimplePrompt,
                systemMessage: enteredsystemMessage,
                aiMessage: enteredaiMessage,
                humanMessage: enteredhumanMessage,

                inputData: formattedInputData
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Prompt updated successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Prompt couldnt be updated. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updated prompt:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(6);
            });
    };

    // Function to get all prompts data
    async function getFullPromptsData(clientApiKey) {
        try {
            const response = await fetch("/llm/getFullPromptsData", {
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
                setPromptsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching prompts details:", error);
        }
    };

    const addKeyValueField = () => {
        setNumFields(numFields + 1); // Increment the number of fields
    };

    // Function to get config IDs
    async function getRAGClientConfigIDs(clientApiKey) {
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
                setRAGConfigIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching config IDs:", error);
        }
    };

    const handleNewDeploymentButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addLLMDeploymentState.APIKey || !addLLMDeploymentState.LLMModelID || !addLLMDeploymentState.LLMpromptId || !addLLMDeploymentState.RAGconfigID) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve all the form data
        var apikey = addLLMDeploymentState.APIKey;

        var selectedLLMModelID = addLLMDeploymentState.LLMModelID;
        var selectedLLMPromptID = addLLMDeploymentState.LLMpromptId;
        var selectedRAGConfigID = addLLMDeploymentState.RAGconfigID;

        // Send data to server.js using fetch
        fetch("/addDeployment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                type: 'llm',
                llmModelID: selectedLLMModelID,
                llmPromptID: selectedLLMPromptID,
                ragConfigID: selectedRAGConfigID
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Deployment added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding Deployment:", error);
            })
            .finally(() => {
                resetForms();
            });
    };

    // Function to update existing deployment
    const handleUpdateDeploymentButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateLLMDeploymentState.APIKey || !updateLLMDeploymentState.deploymentId || !updateLLMDeploymentState.LLMModelID || !updateLLMDeploymentState.LLMpromptId || !updateLLMDeploymentState.RAGconfigID) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected details
        var apikey = updateLLMDeploymentState.APIKey;
        var selectedDeploymentID = updateLLMDeploymentState.deploymentId

        var selectedLLMModelID = updateLLMDeploymentState.LLMModelID;
        var selectedLLMPromptID = updateLLMDeploymentState.LLMpromptId;
        var selectedRAGConfigID = updateLLMDeploymentState.RAGconfigID;

        // Send data to server.js using fetch
        fetch("/updateDeployment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                type: 'llm',
                deploymentID: selectedDeploymentID,
                llmModelID: selectedLLMModelID,
                llmPromptID: selectedLLMPromptID,
                ragConfigID: selectedRAGConfigID
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Deployment updated successfully", true, 2000);
                    resetForms();
                } else if (response.status === 400) {
                    resetForms();
                    handleFlashMessage("Deployment couldnt be updated. Pls try again.", false, 2000);
                } else {
                    resetForms();
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating deployment:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(9);
            });
    }

    // Function to get all deployments data
    async function getDeploymentDetails(clientApiKey) {
        try {
            const response = await fetch("/getFullDeploymentDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    apikey: clientApiKey,
                    type: 'llm'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setDeploymentsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching deployments details:", error);
        }
    };

    // Function to reset the forms to its initial state
    const resetForms = () => {
        setAddLLMModelState({
            APIKey: '',
            mode: '',
            model: '',
            modelName: ''
        });
        setUpdateLLMModelState({
            APIKey: '',
            ModelID: '',
            mode: '',
            model: '',
            modelName: '',
            engine: ''
        });
        setViewLLMModelsState({
            APIKey: ''
        });
        setAddLLMPromptState({
            APIKey: '',
            appType: '',
            promptType: '',
            simplePrompt: '',
            systemMessage: '',
            aiMessage: '',
            humanMessage: '',
            inputData: ''
        });
        setUpdateLLMPromptState({
            APIKey: '',
            promptId: '',
            appType: '',
            promptType: '',
            simplePrompt: '',
            systemMessage: '',
            aiMessage: '',
            humanMessage: '',
            inputData: ''
        });
        setViewLLMPromptsState({
            APIKey: ''
        });
        setAddLLMDeploymentState({
            APIKey: '',
            LLMModelID: '',
            LLMpromptId: '',
            RAGconfigID: ''
        });
        setUpdateLLMDeploymentState({
            APIKey: '',
            deploymentId: '',
            LLMModelID: '',
            LLMpromptId: '',
            RAGconfigID: ''
        });
        setViewLLMDeploymentsState({
            APIKey: ''
        })
        setEngines([]);
        setNumFields(1);
        setFieldsData([]);
    };

    // CSS class for buttons
    const buttonClass = "group relative flex items-center justify-center py-5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

    const submitButtonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-5";

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: '5px'
    };

    const handleLLMModelsButton = () => {
        setMenuNumber(1);
        setDivNumber(3);
        getclientAPIKeys();
        getModes();
        resetForms();
    };

    const handleLLMPromptsButton = () => {
        setMenuNumber(2);
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    const handleDeploymentButton = () => {
        setMenuNumber(3);
        setDivNumber(9);
        getclientAPIKeys();
        resetForms();
    };

    const showAddLLMModelForm = () => {
        setDivNumber(1);
        getclientAPIKeys();
        resetForms();
    };

    const viewAllLLMModels = () => {
        setDivNumber(3);
        getclientAPIKeys();
        resetForms();
    };

    const showAddLLMPromptForm = () => {
        setDivNumber(4);
        getclientAPIKeys();
        resetForms();
    };

    const ViewAllLLMPrompts = () => {
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    const showAddDeploymentForm = () => {
        setDivNumber(7);
        getclientAPIKeys();
        resetForms();
    };

    const ViewAllDeployments = () => {
        setDivNumber(9);
        getclientAPIKeys();
        resetForms();
    };

    // Update the click handler for model IDs
    const handleModelClick = async (APIKey, ModelID, mode, modelType, modelName, engine, cloudAPIKey) => {
        setDivNumber(2);

        await getLLMClientModelIDs(APIKey);
        await getModels(mode);
        await getModelNames(modelType);
        await getEngines(modelName);

        setUpdateLLMModelState({
            APIKey: APIKey,
            ModelID: ModelID,
            mode: mode,
            model: modelType,
            modelName: modelName,
            engine: engine,
            cloudAPIKey: cloudAPIKey
        });
    };

    // Update the click handler for prompt IDs
    const handlePromptClick = async (ApiKey, PromptID, AppType, MemoryType, KValue, TokenLimit, PromptType, SimplePrompt, SystemMessage, AIMessage, HumanMessage, InputData) => {
        setDivNumber(5);

        await getLLMClientPromptIDs(ApiKey);

        setUpdateLLMPromptState({
            APIKey: ApiKey,
            promptId: PromptID,

            appType: AppType,
            memoryType: MemoryType,
            kValue: KValue,
            tokenLimit: TokenLimit,

            promptType: PromptType,
            simplePrompt: SimplePrompt,
            systemMessage: SystemMessage,
            aiMessage: AIMessage,
            humanMessage: HumanMessage
        });

        // Extract key-value pairs from InputData and convert them to an array of objects
        const extractedFieldsData = Object.entries(InputData).map(([key, value]) => ({ key, value }));

        // Set the state with the extracted key-value pairs
        setNumFields(extractedFieldsData.length);
        setFieldsData(extractedFieldsData);
    };

    // Update the click handler for deployment IDs
    const handleDeploymentClick = async (APIKey, deploymentId, llmModelId, llmPromptId, ragConfigId) => {
        setDivNumber(8);

        await getDeploymentIDs(APIKey);
        await getLLMClientModelIDs(APIKey);
        await getLLMClientPromptIDs(APIKey);
        await getRAGClientConfigIDs(APIKey);

        setUpdateLLMDeploymentState({
            APIKey: APIKey,
            deploymentId: deploymentId,
            LLMModelID: llmModelId,
            LLMpromptId: llmPromptId,
            RAGconfigID: ragConfigId
        });
    };


    return (
        <div>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handleLLMModelsButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Manage Models
                </button>
                <button
                    onClick={handleLLMPromptsButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Manage Prompts
                </button>
                <button
                    onClick={handleDeploymentButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Deployment
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
                <div id='LLMModels' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddLLMModelForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={viewAllLLMModels}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Prompts Menu */}
            {menuNumber === 2 && (
                <div id='LLMPrompts' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddLLMPromptForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllLLMPrompts}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Deployments Menu */}
            {menuNumber === 3 && (
                <div id='Deployments' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddDeploymentForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllDeployments}
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
                                    value={addLLMModelState.APIKey}
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
                                    id="mode"
                                    name="mode"
                                    value={addLLMModelState.mode}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Mode</option>
                                    {Modes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="model"
                                    name="model"
                                    value={addLLMModelState.model}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model</option>
                                    {Models.map((data) => (
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
                                    value={addLLMModelState.modelName}
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
                            {addLLMModelState.modelName && Engines[0] !== '' && (
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
                            {addLLMModelState.mode === "Cloud" && (
                                <Input
                                    id="cloudAPIKey"
                                    name="cloudAPIKey"
                                    key="cloudAPIKey"
                                    handleChange={handleChange1}
                                    value={addLLMModelState.cloudAPIKey}
                                    type="text"
                                    isRequired="true"
                                    placeholder="Enter Cloud API Key"
                                />
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
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={updateLLMModelState.APIKey}
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
                            <div className="mb-2">
                                <select
                                    id="ModelID"
                                    name="ModelID"
                                    value={updateLLMModelState.ModelID}
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
                                    id="mode"
                                    name="mode"
                                    value={updateLLMModelState.mode}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Mode</option>
                                    {Modes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="model"
                                    name="model"
                                    value={updateLLMModelState.model}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model</option>
                                    {Models.map((data) => (
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
                                    value={updateLLMModelState.modelName}
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
                            {updateLLMModelState.modelName && Engines[0] !== '' && (
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
                            {updateLLMModelState.mode === "Cloud" && (
                                <Input
                                    id="cloudAPIKey"
                                    name="cloudAPIKey"
                                    key="cloudAPIKey"
                                    handleChange={handleChange2}
                                    value={updateLLMModelState.cloudAPIKey}
                                    type="text"
                                    isRequired="true"
                                    placeholder="Enter Cloud API Key"
                                />
                            )}
                        </div>
                        <button className={submitButtonClass} onClick={handleUpdateModelButton}>Update</button>
                    </form>
                </div>
            )}

            {/* View All Models Data div */}
            {divNumber === 3 && (
                <div>
                    <h1 style={h1Style}>All Models</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-2">
                            <select
                                id="APIKey"
                                name="APIKey"
                                value={viewLLMModelsState.APIKey}
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

                    {viewLLMModelsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model Name</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Engine</th>
                                    </tr>
                                </thead>
                                {/* Table body with configs data */}
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
                                                    onClick={() => handleModelClick(viewLLMModelsState.APIKey, model.modelId, model.mode, model.modelType, model.modelName, model.engine, model.cloudAPIKey)}
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

            {/* New Prompt div */}
            {divNumber === 4 && (
                <div>
                    <h1 style={h1Style}>Add New Prompt</h1>

                    <form className="mt-3 space-y-6" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <div className="">
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={addLLMPromptState.APIKey}
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

                            <div className="mb-2">
                                <select
                                    id="appType"
                                    name="appType"
                                    value={addLLMPromptState.appType}
                                    onChange={handleChange4}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select App Type</option>
                                    <option value="simple">Simple</option>
                                    <option value="conversational">Conversational</option>
                                </select>
                            </div>

                            {addLLMPromptState.appType === "conversational" && (
                                <div>
                                    <div className="mb-2">
                                        <select
                                            id="memoryType"
                                            name="memoryType"
                                            value={addLLMPromptState.memoryType}
                                            onChange={handleChange4}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Memory Type</option>
                                            <option value="buffer">Buffer</option>
                                            <option value="windowBuffer">Window Buffer</option>
                                            <option value="tokenBuffer">Token Buffer</option>
                                            <option value="summarised">Summarised</option>
                                        </select>
                                    </div>

                                    {addLLMPromptState.memoryType === "windowBuffer" && (
                                        <div className="mb-2">
                                            <input
                                                id="kValue"
                                                name="kValue"
                                                type="text"
                                                onChange={handleChange4}
                                                value={addLLMPromptState.kValue}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                required
                                                placeholder="Enter k Value"
                                            />
                                        </div>
                                    )}

                                    {addLLMPromptState.memoryType === "tokenBuffer" && (
                                        <div className="mb-2">
                                            <input
                                                id="tokenLimit"
                                                name="tokenLimit"
                                                type="text"
                                                onChange={handleChange4}
                                                value={addLLMPromptState.tokenLimit}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                required
                                                placeholder="Enter Tokens Limit"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mb-2">
                                <select
                                    id="promptType"
                                    name="promptType"
                                    value={addLLMPromptState.promptType}
                                    onChange={handleChange4}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select Prompt Type</option>
                                    <option value="simple">Simple</option>
                                    <option value="system">System</option>
                                </select>
                            </div>

                            {addLLMPromptState.promptType === "simple" && (
                                <div className="mb-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                    <textarea
                                        id="simplePrompt"
                                        name="simplePrompt"
                                        value={addLLMPromptState.simplePrompt}
                                        onChange={handleChange4}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder="Enter Prompt"
                                        required
                                    />
                                </div>
                            )}

                            {addLLMPromptState.promptType === "system" && (
                                <div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="systemMessage"
                                            name="systemMessage"
                                            value={addLLMPromptState.systemMessage}
                                            onChange={handleChange4}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter System Message"
                                            required
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="aiMessage"
                                            name="aiMessage"
                                            value={addLLMPromptState.aiMessage}
                                            onChange={handleChange4}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter AI Message"
                                            required
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="humanMessage"
                                            name="humanMessage"
                                            value={addLLMPromptState.humanMessage}
                                            onChange={handleChange4}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter Human Message"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {addLLMPromptState.promptType && (
                                <div>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {[...Array(numFields)].map((_, index) => (
                                            <div key={index}>
                                                <div id={`keyValueFields-${index}`} style={{ display: 'flex', gap: '1rem' }}>
                                                    <div className="mb-2" style={{ flex: 1 }}>
                                                        <input
                                                            id={`key-${index}`}
                                                            name={`key-${index}`}
                                                            type="text"
                                                            onChange={(e) => handleChangeKeyValue(e, index, 'key')}
                                                            value={fieldsData[index] ? fieldsData[index].key : ''}
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            required
                                                            placeholder="Key"
                                                        />
                                                    </div>
                                                    <div className="mb-2" style={{ flex: 1 }}>
                                                        <input
                                                            id={`value-${index}`}
                                                            name={`value-${index}`}
                                                            type="text"
                                                            onChange={(e) => handleChangeKeyValue(e, index, 'value')}
                                                            value={fieldsData[index] ? fieldsData[index].value : ''}
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            required
                                                            placeholder="Value"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={addKeyValueField}
                                            className="font-medium text-purple-600 hover:text-purple-500 text-center text-sm mt-1">
                                            Add Fields
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </form>
                    <button className={submitButtonClass} onClick={handleNewPromptButton}>Add Prompt</button>
                </div>
            )}

            {/* Update Existing Prompt div */}
            {divNumber === 5 && (
                <div>
                    <h1 style={h1Style}>Update Existing Prompt</h1>

                    <form className="mt-3 space-y-6" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <div className="">
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={updateLLMPromptState.APIKey}
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

                            <div className="mb-2">
                                <select
                                    id="promptId"
                                    name="promptId"
                                    value={updateLLMPromptState.promptId}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select Prompt ID</option>
                                    {PromptIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-2">
                                <select
                                    id="appType"
                                    name="appType"
                                    value={updateLLMPromptState.appType}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select App Type</option>
                                    <option value="simple">Simple</option>
                                    <option value="conversational">Conversational</option>
                                </select>
                            </div>

                            {updateLLMPromptState.appType === "conversational" && (
                                <div>
                                    <div className="mb-2">
                                        <select
                                            id="memoryType"
                                            name="memoryType"
                                            value={updateLLMPromptState.memoryType}
                                            onChange={handleChange5}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Memory Type</option>
                                            <option value="buffer">Buffer</option>
                                            <option value="windowBuffer">Window Buffer</option>
                                            <option value="tokenBuffer">Token Buffer</option>
                                            <option value="summarised">Summarised</option>
                                        </select>
                                    </div>

                                    {updateLLMPromptState.memoryType === "windowBuffer" && (
                                        <div className="mb-2">
                                            <input
                                                id="kValue"
                                                name="kValue"
                                                type="text"
                                                onChange={handleChange5}
                                                value={updateLLMPromptState.kValue}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                required
                                                placeholder="Enter k Value"
                                            />
                                        </div>
                                    )}

                                    {updateLLMPromptState.memoryType === "tokenBuffer" && (
                                        <div className="mb-2">
                                            <input
                                                id="tokenLimit"
                                                name="tokenLimit"
                                                type="text"
                                                onChange={handleChange5}
                                                value={updateLLMPromptState.tokenLimit}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                required
                                                placeholder="Enter Tokens Limit"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mb-2">
                                <select
                                    id="promptType"
                                    name="promptType"
                                    value={updateLLMPromptState.promptType}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select Prompt Type</option>
                                    <option value="simple">Simple</option>
                                    <option value="system">System</option>
                                </select>
                            </div>

                            {updateLLMPromptState.promptType === "simple" && (
                                <div className="mb-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                    <textarea
                                        id="simplePrompt"
                                        name="simplePrompt"
                                        value={updateLLMPromptState.simplePrompt}
                                        onChange={handleChange5}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder="Enter Prompt"
                                        required
                                    />
                                </div>
                            )}

                            {updateLLMPromptState.promptType === "system" && (
                                <div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="systemMessage"
                                            name="systemMessage"
                                            value={updateLLMPromptState.systemMessage}
                                            onChange={handleChange5}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter System Message"
                                            required
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="aiMessage"
                                            name="aiMessage"
                                            value={updateLLMPromptState.aiMessage}
                                            onChange={handleChange5}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter AI Message"
                                            required
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="humanMessage"
                                            name="humanMessage"
                                            value={updateLLMPromptState.humanMessage}
                                            onChange={handleChange5}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter Human Message"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {updateLLMPromptState.promptType && (
                                <div>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {[...Array(numFields)].map((_, index) => (
                                            <div key={index}>
                                                <div id={`keyValueFields-${index}`} style={{ display: 'flex', gap: '1rem' }}>
                                                    <div className="mb-2" style={{ flex: 1 }}>
                                                        <input
                                                            id={`key-${index}`}
                                                            name={`key-${index}`}
                                                            type="text"
                                                            onChange={(e) => handleChangeKeyValue(e, index, 'key')}
                                                            value={fieldsData[index] ? fieldsData[index].key : ''}
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            required
                                                            placeholder="Key"
                                                        />
                                                    </div>
                                                    <div className="mb-2" style={{ flex: 1 }}>
                                                        <input
                                                            id={`value-${index}`}
                                                            name={`value-${index}`}
                                                            type="text"
                                                            onChange={(e) => handleChangeKeyValue(e, index, 'value')}
                                                            value={fieldsData[index] ? fieldsData[index].value : ''}
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            required
                                                            placeholder="Value"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={addKeyValueField}
                                            className="font-medium text-purple-600 hover:text-purple-500 text-center text-sm mt-1">
                                            Add Fields
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </form>
                    <button className={submitButtonClass} onClick={handleUpdatePromptButton}>Update</button>
                </div>
            )}

            {/* View All Prompts Data div */}
            {divNumber === 6 && (
                <div>
                    <h1 style={h1Style}>All Prompts</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-4">
                            <select
                                id="APIKey"
                                name="APIKey"
                                value={viewLLMPromptsState.APIKey}
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

                    {viewLLMPromptsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Prompt ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>App Type</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Memory Type</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Prompt Type</th>
                                    </tr>
                                </thead>
                                {/* Table body with prompts data */}
                                {promptsData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                    </tr>
                                ) : (
                                    promptsData.map((config, index) => (
                                        <tr key={index}>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                title={config.promptType === 'simple' ? `Prompt: ${config.simplePrompt}` : `System Message: ${config.systemMessage}\nAI Message: ${config.aiMessage}\nHuman Message: ${config.humanMessage}`}
                                                onClick={() => handlePromptClick(viewLLMPromptsState.APIKey, config.promptId, config.appType, config.memoryType, config.kValue, config.tokenLimit, config.promptType, config.simplePrompt, config.systemMessage, config.aiMessage, config.humanMessage, config.inputData)}
                                            >
                                                {config.promptId}
                                            </td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.appType}</td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }} >
                                                {config.appType === 'simple' ? '-' : config.memoryType}
                                            </td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.promptType}</td>
                                        </tr>
                                    ))
                                )}
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* New Deployment div */}
            {divNumber === 7 && (
                <div>
                    <h1 style={h1Style}>Add New Deployment</h1>

                    <form className="mt-6 space-y-6">
                        <div className="">
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={addLLMDeploymentState.APIKey}
                                    onChange={handleChange7}
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
                                    id="LLMModelID"
                                    name="LLMModelID"
                                    value={addLLMDeploymentState.LLMModelID}
                                    onChange={handleChange7}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select LLM Model ID</option>
                                    {ModelIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="LLMpromptId"
                                    name="LLMpromptId"
                                    value={addLLMDeploymentState.LLMpromptId}
                                    onChange={handleChange7}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select LLM Prompt ID</option>
                                    {PromptIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="RAGconfigID"
                                    name="RAGconfigID"
                                    value={addLLMDeploymentState.RAGconfigID}
                                    onChange={handleChange7}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select RAG Config ID</option>
                                    {RAGconfigIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button className={submitButtonClass} onClick={handleNewDeploymentButton}>Add</button>
                    </form>
                </div>
            )}

            {/* Update Existing Deployment div */}
            {divNumber === 8 && (
                <div>
                    <h1 style={h1Style}>Update Existing Deployment</h1>

                    <form className="mt-6 space-y-6">
                        <div className="">
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={updateLLMDeploymentState.APIKey}
                                    onChange={handleChange8}
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
                            <div className="mb-2">
                                <select
                                    id="deploymentId"
                                    name="deploymentId"
                                    value={updateLLMDeploymentState.deploymentId}
                                    onChange={handleChange8}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select Deployment ID</option>
                                    {deploymentIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="LLMModelID"
                                    name="LLMModelID"
                                    value={updateLLMDeploymentState.LLMModelID}
                                    onChange={handleChange8}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select LLM Model ID</option>
                                    {ModelIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="LLMpromptId"
                                    name="LLMpromptId"
                                    value={updateLLMDeploymentState.LLMpromptId}
                                    onChange={handleChange8}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select LLM Prompt ID</option>
                                    {PromptIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="RAGconfigID"
                                    name="RAGconfigID"
                                    value={updateLLMDeploymentState.RAGconfigID}
                                    onChange={handleChange8}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select RAG Config ID</option>
                                    {RAGconfigIDs.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button className={submitButtonClass} onClick={handleUpdateDeploymentButton}>Update</button>
                    </form>
                </div>
            )}

            {/* View All Deployments Data div */}
            {divNumber === 9 && (
                <div>
                    <h1 style={h1Style}>All Deployments</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-2">
                            <select
                                id="APIKey"
                                name="APIKey"
                                value={viewLLMDeploymentsState.APIKey}
                                onChange={handleChange9}
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

                    {viewLLMDeploymentsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }} rowSpan={2}>Deployment ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }} colSpan={2}>LLM</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }} >RAG</th>
                                    </tr>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Prompt ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Config ID</th>
                                    </tr>
                                </thead>
                                {/* Table body with deployments data */}
                                <tbody>
                                    {deploymentsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        deploymentsData.map((deployment, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => handleDeploymentClick(viewLLMDeploymentsState.APIKey, deployment.deploymentId, deployment.llmModelId, deployment.llmPromptId, deployment.ragConfigId)}
                                                >
                                                    {deployment.deploymentId}
                                                </td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{deployment.llmModelId}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{deployment.llmPromptId}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{deployment.ragConfigId}</td>
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