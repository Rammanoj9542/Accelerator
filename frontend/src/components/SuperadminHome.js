import { useState } from 'react';
import { registrationFields_Superadmin } from "../constants/formFields";
import Input from "./Input";

// Define form fields based on the imported registrationFields from constants
const fields = registrationFields_Superadmin;

// Initialize the form state with empty values for each field
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function SuperadminHome() {
    // Declare and initialize state variables
    const [addOrgState, setAddOrgState] = useState({
        orgName: '',
        dbURI: '',
        orgAddress: ''
    });
    const [updateOrgState, setUpdateOrgState] = useState({
        orgId: '',
        orgName: '',
        dbURI: '',
        orgAddress: ''
    });
    const [signupState, setSignupState] = useState(fieldsState);
    const [updateAdminState, setUpdateAdminState] = useState({
        username: '',
        organisation: ''
    });

    const [divNumber, setDivNumber] = useState(0); // State to track the form number
    const [menuNumber, setMenuNumber] = useState(0); // State to track the menu/options number
    const [mainMenuNumber, setMainMenuNumber] = useState(1); // State to track the main menu/options number

    const [orgIDs, setOrgIDs] = useState([]);

    const [orgsData, setOrgsData] = useState([]);
    const [adminsData, setAdminsData] = useState([]);

    // State to control flash messages
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    // Functions to handle input field changes
    const handleChange1 = (e) => {
        const { id, value } = e.target;
        let updatedValue = value;

        if (id === "dbURI") {
            // Omit spaces from dbURI
            updatedValue = value.replace(/\s/g, '');
        }

        setAddOrgState((prevAddOrgState) => ({
            ...prevAddOrgState,
            [id]: updatedValue
        }));
    };
    const handleChange2 = (e) => {
        const { id, value } = e.target;
        let updatedValue = value;

        if (id === "orgId") {
            setUpdateOrgState({
                orgName: '',
                dbURI: '',
                orgAddress: ''
            });
        }

        if (id === "dbURI") {
            // Omit spaces from dbURI
            updatedValue = value.replace(/\s/g, '');
        }

        setUpdateOrgState((prevState) => ({
            ...prevState,
            [id]: updatedValue
        }));
    };
    const handleChange4 = (e) => {
        if (e.target.id === "contactnumber") {
            const onlyNums = e.target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            setSignupState({ ...signupState, [e.target.id]: onlyNums });
        } else {
            setSignupState({ ...signupState, [e.target.id]: e.target.value });
        }
    };
    const handleChange5 = (e) => setUpdateAdminState({ ...updateAdminState, [e.target.name]: e.target.value });

    // Handle Org Registration button
    const handleManageOrgButton = () => {
        setMainMenuNumber(2);
    };

    // Function to handle dashboard button click
    const handleDashboardButton = () => {
        alert("Page is not yet ready");
        // window.location.href = '/superadmindashboard';
    }

    // Function to handle organisation button click
    const handleOrgButton = () => {
        setMenuNumber(1);
        setDivNumber(3);
        getFullOrgsData();
    }

    // Function to handle admin button click
    const handleAdminButton = () => {
        setMenuNumber(2);
        setDivNumber(6);
        getFullOrgsData();
        getFullAdminsData();
    }

    const viewAddOrg = () => {
        setDivNumber(1);
    };

    const viewViewOrg = () => {
        setDivNumber(3);
        getFullOrgsData();
    };

    const viewAddAdmin = () => {
        setDivNumber(4);
    };

    const viewViewAdmin = () => {
        setDivNumber(6);
        getFullAdminsData();
    };

    const handleSubmit1 = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addOrgState.orgName || !addOrgState.orgAddress || !addOrgState.dbURI) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        var enteredOrgName = addOrgState.orgName;
        var enteredDBURI = addOrgState.dbURI;
        var enteredOrgAddress = addOrgState.orgAddress;

        fetch("/addOrg", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orgName: enteredOrgName,
                dbURI: enteredDBURI,
                orgAddress: enteredOrgAddress
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Org added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Org couldnt be added. Pls try again.", false, 2000);
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
                setDivNumber(3);
                getFullOrgsData();
            });
    };

    const handleSubmit2 = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateOrgState.orgId || !updateOrgState.orgName || !updateOrgState.orgAddress) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        var selectedOrgID = updateOrgState.orgId;
        var enteredOrgName = updateOrgState.orgName;
        var enteredDBURI = updateOrgState.dbURI;
        var enteredOrgAddress = updateOrgState.orgAddress;

        fetch("/updateOrg", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orgId: selectedOrgID,
                orgName: enteredOrgName,
                dbURI: enteredDBURI,
                orgAddress: enteredOrgAddress
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Org updated successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Org couldnt be updated. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updated org:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(3);
                getFullOrgsData();
            });
    };

    // Function to handle form submission
    const handleSubmit4 = async (e) => {
        e.preventDefault();
        if (!signupState.firstname || !signupState.lastname || !signupState.email_address || !signupState.username || !signupState.password || !signupState.contactnumber || !signupState.organisation) {
            handleFlashMessage("Please input all fields", false, 2000);
            return;
        }

        const validationResult = isValidPassword(signupState.password);
        if (!validationResult.isValid) {
            // Handle case where the password does not meet the criteria
            handleFlashMessage(`Password must contain at least ${validationResult.missingCriteria}.`, false);
        } else {
            await createAccount();
        }
    };

    const handleSubmit5 = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateAdminState.username || !updateAdminState.organisation) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        var selectedUsername = updateAdminState.username;
        var selectedOrg = updateAdminState.organisation;

        fetch("/updateAdmin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: selectedUsername,
                organisation: selectedOrg
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Admin updated successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Admin couldnt be updated. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating Admin:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(6);
                getFullAdminsData();
            });
    };

    // Function to check if the password meets the required constraints
    const isValidPassword = (password) => {
        if (!/(?=.*\d)/.test(password)) {
            return { isValid: false, missingCriteria: ["one number"] };
        }

        if (!/(?=.*[a-z])/.test(password)) {
            return { isValid: false, missingCriteria: ["one lowercase letter"] };
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            return { isValid: false, missingCriteria: ["one uppercase letter"] };
        }

        if (!/[!@#$%^&*]/.test(password)) {
            return { isValid: false, missingCriteria: ["one special character"] };
        }

        if (password.length < 8) {
            return { isValid: false, missingCriteria: ["8 characters"] };
        }

        return { isValid: true };
    };

    // Handle Account Creation here
    const createAccount = async () => {
        try {
            const response = await fetch("/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupState),
            });

            const responseData = await response.json();
            if (response.ok) {
                // Generate and add API key
                const apiKeyResponse = await fetch("/generateclientApiKeyWhileRegistration", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userid: responseData.userid }),
                });

                const apiKeyData = await apiKeyResponse.json();
                if (apiKeyResponse.ok) {
                    handleFlashMessage(apiKeyData.message, true);
                } else {
                    handleFlashMessage(apiKeyData.message, false);
                }

                handleFlashMessage(responseData.message, true);
                resetForms();
            } else {
                handleFlashMessage(responseData.message, false);
            }
        } catch (error) {
            console.error('Error:', error.message);
            handleFlashMessage("An unknown error occurred. Please try again later.", false);
        }
    };

    // Function to get org IDs
    async function getOrgIds() {
        try {
            const response = await fetch("/getOrgIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                setOrgIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching org IDs:", error);
        }
    };

    async function getFullOrgsData() {
        try {
            const response = await fetch("/getFullOrgsData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setOrgsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching organisation details:", error);
        }
    }

    async function getFullAdminsData() {
        try {
            const response = await fetch("/getFullAdminsData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAdminsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching admins details:", error);
        }
    }

    // Update the click handler for org IDs
    const handleOrgClick = async (orgId, orgName, orgAddress, dbURI) => {
        setDivNumber(2);

        await getOrgIds();

        setUpdateOrgState({
            orgId: orgId,
            orgName: orgName,
            dbURI: dbURI,
            orgAddress: orgAddress
        });
    };

    // Update the click handler for admin username
    const handleAdminClick = async (username, organisation) => {
        setDivNumber(5);

        await getFullAdminsData();
        await getFullOrgsData();

        setUpdateAdminState({
            username: username,
            organisation: organisation
        });
    };

    const handleBackButton = () => {
        setMainMenuNumber(1);
        setMenuNumber(0);
        setDivNumber(0);
    }

    // Function to handle flash messages
    const handleFlashMessage = (text, success) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), 3000);
    };

    // CSS class for buttons
    const buttonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-1";

    const submitButtonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-5";

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold'
    };

    // Function to reset the forms to its initial state
    const resetForms = () => {
        setAddOrgState({
            orgName: '',
            orgAddress: ''
        });
        setUpdateOrgState({
            orgId: '',
            orgName: '',
            orgAddress: ''
        });
        const signupState = {};
        fields.forEach(field => signupState[field.id] = '');
        setSignupState(signupState);
    };


    return (
        <div>

            {/* Buttons for user registration and dashboard */}
            {mainMenuNumber === 1 && (
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleManageOrgButton}
                        className={buttonClass}
                        style={{ width: '220px', height: '40px' }}>
                        Manage Organisation
                    </button>
                    <button
                        onClick={handleDashboardButton}
                        className={buttonClass}
                        style={{ width: '220px', height: '40px' }}>
                        Dashboard
                    </button>
                </div>
            )}

            {mainMenuNumber === 2 && (
                <div className="flex justify-center items-center mt-2">
                    <button
                        onClick={handleOrgButton}
                        className={buttonClass}
                        style={{ width: '150px', height: '40px', marginRight: '70px' }}>
                        Organisation
                    </button>
                    <button
                        onClick={handleAdminButton}
                        className={buttonClass}
                        style={{ width: '150px', height: '40px' }}>
                        Admin
                    </button>
                </div>
            )}

            {/* Organisation Menu */}
            {menuNumber === 1 && (
                <div id='orgMenu' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={viewAddOrg}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={viewViewOrg}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Admin Menu */}
            {menuNumber === 2 && (
                <div id='adminMeny' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={viewAddAdmin}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={viewViewAdmin}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Displaying success flash message */}
            {flashMessage.success && (
                <div id="successFlashMsg">{flashMessage.text}</div>
            )}

            {/* Displaying failure flash message */}
            {flashMessage.failure && (
                <div id="failFlashMsg">{flashMessage.text}</div>
            )}

            {/* New Org div */}
            {divNumber === 1 && (
                <div>
                    <h1 style={h1Style}>Add Organisation</h1>
                    <form className="mt-3 space-y-6">
                        <div className="mb-1">
                            <Input
                                id="orgName"
                                name="orgName"
                                type="text"
                                value={addOrgState.orgName}
                                handleChange={handleChange1}
                                placeholder="Enter Organisation Name"
                                className="mt-1 p-2 border rounded-md w-full"
                                isRequired={true}
                            />
                        </div>
                        <div className="mb-1">
                            <Input
                                id="dbURI"
                                name="dbURI"
                                type="text"
                                value={addOrgState.dbURI}
                                handleChange={handleChange1}
                                placeholder="Enter Database URI"
                                className="mt-1 p-2 border rounded-md w-full"
                                isRequired={true}
                            />
                        </div>
                        <div className="mb-1" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                            <textarea
                                id="orgAddress"
                                name="orgAddress"
                                value={addOrgState.orgAddress}
                                onChange={handleChange1}
                                className="p-2 border rounded-md w-full"
                                placeholder="Enter Organisation Address"
                                required
                            />
                        </div>
                    </form>
                    <button className={submitButtonClass} onClick={handleSubmit1}>Register</button>
                </div>
            )}

            {/* Update Org div */}
            {divNumber === 2 && (
                <div>
                    <h1 style={h1Style}>Update Organisation</h1>
                    <form className="mt-3 space-y-6">
                        <div className="mb-1">
                            <select
                                id="orgId"
                                name="orgId"
                                value={updateOrgState.orgId}
                                onChange={handleChange2}
                                className="mt-1 p-2 border rounded-md w-full"
                                required>
                                <option value="">Select Org ID</option>
                                {orgIDs.map((data) => (
                                    <option key={data} value={data}>
                                        {data}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-1">
                            <Input
                                id="orgName"
                                name="orgName"
                                type="text"
                                value={updateOrgState.orgName}
                                handleChange={handleChange2}
                                placeholder="Enter Organisation Name"
                                className="mt-1 p-2 border rounded-md w-full"
                                isRequired={true}
                            />
                        </div>
                        <div className="mb-1">
                            <Input
                                id="dbURI"
                                name="dbURI"
                                type="text"
                                value={updateOrgState.dbURI}
                                handleChange={handleChange2}
                                placeholder="Enter Database URI"
                                className="mt-1 p-2 border rounded-md w-full"
                                isRequired={true}
                            />
                        </div>
                        <div className="mb-1" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                            <textarea
                                id="orgAddress"
                                name="orgAddress"
                                value={updateOrgState.orgAddress}
                                onChange={handleChange2}
                                className="p-2 border rounded-md w-full"
                                placeholder="Enter Organisation Address"
                                required
                            />
                        </div>
                    </form>
                    <button className={submitButtonClass} onClick={handleSubmit2}>Update</button>
                </div>
            )}

            {/* View All Orgs Data div */}
            {divNumber === 3 && (
                <div>
                    <h1 style={h1Style}>All Organisations</h1>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                <tr>
                                    <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>ID</th>
                                    <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Name</th>
                                    <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>DB URI</th>
                                    <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Address</th>
                                </tr>
                            </thead>
                            {/* Table body with Orgs data */}
                            <tbody>
                                {orgsData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                    </tr>
                                ) : (
                                    orgsData.map((org, index) => (
                                        <tr key={index}>
                                            <td
                                                style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                onClick={() => handleOrgClick(org.orgId, org.orgName, org.orgAddress, org.dbURI)}
                                            >
                                                {org.orgId}
                                            </td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{org.orgName}</td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{org.dbURI}</td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{org.orgAddress}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* New Admin div */}
            {divNumber === 4 && (
                <div>
                    <h1 style={h1Style}>Admin Registration</h1>
                    <form style={{ marginBottom: '15px' }}>
                        <div className="">
                            {fields.map((field) =>
                                field.type === "select" ? ( // Check if the field is a select dropdown
                                    <div key={field.id} className="">
                                        <select
                                            id={field.id}
                                            name={field.name}
                                            value={signupState[field.id]}
                                            onChange={handleChange4}
                                            className="p-2 border rounded-md w-full"
                                            required={field.isRequired}
                                        >
                                            <option value="">Select {field.labelText}</option>
                                            {orgsData.map((option) => (
                                                <option key={option.orgName} value={option.orgId}>
                                                    {option.orgName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div key={field.id} className="">
                                        <Input
                                            key={field.id}
                                            handleChange={handleChange4}
                                            value={signupState[field.id]}
                                            labelText={field.labelText}
                                            labelFor={field.labelFor}
                                            id={field.id}
                                            name={field.name}
                                            type={field.type}
                                            isRequired={field.isRequired}
                                            placeholder={field.placeholder}
                                            maxLength={field.maxLength}
                                            minLength={field.minLength}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </form>

                    <button onClick={handleSubmit4} className={buttonClass}>Register</button>
                </div>
            )}

            {/* Update Admin div */}
            {divNumber === 5 && (
                <div>
                    <h1 style={h1Style}>Update Admin</h1>
                    <form className="mt-3 space-y-6" style={{ marginBottom: '15px' }}>
                        <div className="">
                            <div className="mb-4">
                                <select
                                    id="username"
                                    name="username"
                                    value={updateAdminState.username}
                                    onChange={handleChange5}
                                    className="p-2 border rounded-md w-full"
                                    required={true}
                                >
                                    <option value="">Select Admin Username</option>
                                    {adminsData.map((option) => (
                                        <option key={option.username} value={option.username}>
                                            {option.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <select
                                    id="organisation"
                                    name="organisation"
                                    value={updateAdminState.organisation}
                                    onChange={handleChange5}
                                    className="p-2 border rounded-md w-full"
                                    required={true}
                                >
                                    <option value="">Select Organisation ID</option>
                                    {orgsData.map((option) => (
                                        <option key={option.orgId} value={option.orgId}>
                                            {option.orgId}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </form>

                    <button onClick={handleSubmit5} className={buttonClass}>Update</button>
                </div>
            )}

            {/* View All Admins Data div */}
            {divNumber === 6 && (
                <div>
                    <h1 style={h1Style}>All Admins</h1>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                <tr>
                                    <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>S No.</th>
                                    <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Username</th>
                                    <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Org ID</th>
                                </tr>
                            </thead>
                            {/* Table body with Admins data */}
                            <tbody>
                                {adminsData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                    </tr>
                                ) : (
                                    adminsData.map((admin, index) => (
                                        <tr key={index}>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{index + 1}</td>
                                            <td
                                                style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                onClick={() => handleAdminClick(admin.username, admin.organisation)}
                                            >
                                                {admin.username}
                                            </td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{admin.organisation}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {mainMenuNumber !== 1 && (
                <div className="text-right mt-5">
                    <button onClick={handleBackButton} className="text-sm text-gray-600 font-medium text-purple-600 hover:text-purple-500">
                        Back to Home
                    </button>
                </div>
            )}

        </div>
    )
}