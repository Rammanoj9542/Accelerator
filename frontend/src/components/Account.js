import { useEffect, useState, useCallback } from 'react';

export default function UserAccount() {
    // User details state
    const [userDetails, setUserDetails] = useState({});

    // State to control flash messages
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    const [APIKeysData, setAPIKeysData] = useState([]);

    const getUserDetails = useCallback(async () => {
        try {
            const response = await fetch('/get_user_details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const userDetailsData = await response.json();
                setUserDetails(userDetailsData);
            } else if (response.status === 404) {
                console.error("User not found");
                handleFlashMessage("User not found", false);
            } else {
                console.error("Failed to fetch user details");
                handleFlashMessage("Failed to fetch user details", false);
            }
        } catch (error) {
            console.error("Error:", error);
            handleFlashMessage("Error: " + error, false);
        }
    }, []);

    // Get keys data from DB
    const getclientAPIKeys = useCallback(async () => {
        try {
            const response = await fetch("/clientApiKeysData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAPIKeysData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching keys:", error);
            handleFlashMessage("Error: " + error, false);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            await getUserDetails();
            await getclientAPIKeys();
        };

        fetchInitialData();
    }, [getUserDetails, getclientAPIKeys]);

    const createNewAPIKey = async () => {
        try {
            // Generate and add API key
            const apiKeyResponse = await fetch("/generateNewClientApiKey", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const apiKeyData = await apiKeyResponse.json();
            if (apiKeyResponse.ok) {
                handleFlashMessage(apiKeyData.message, true);
            } else {
                handleFlashMessage(apiKeyData.message, false);
            }
            
            getclientAPIKeys();
        } catch (error) {
            console.error('Error:', error.message);
            handleFlashMessage("An unknown error occurred. Please try again later.", false);
        }
    };

    // Function to handle flash messages
    const handleFlashMessage = (text, success) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), 2000);
    };

    const InputField = ({ label, value }) => {
        return (
            <div className='flex flex-row items-center' style={{ margin: '10px 30px 10px 30px' }}>
                <label htmlFor={label.toLowerCase()}>{label}:</label>
                <div className="flex-grow"></div>
                <input value={value} className={fixedInputClass} disabled />
            </div>
        );
    }

    // CSS class for input fields
    const fixedInputClass = "rounded-md appearance-none relative block px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm w-60";


    return (
        <div>

            {/* Displaying success flash message */}
            {flashMessage.success && (
                <div id="successFlashMsg">
                    {flashMessage.text}
                </div>
            )}

            {/* Displaying failure flash message */}
            {flashMessage.failure && (
                <div id="failFlashMsg">
                    {flashMessage.text}
                </div>
            )}

            {/* User detail input fields */}
            <InputField label="First Name" value={userDetails.firstname} />
            <InputField label="Last Name" value={userDetails.lastname} />
            <InputField label="Username" value={userDetails.username} />
            <InputField label="Email" value={userDetails.email} />
            <InputField label="Contact Number" value={userDetails.number} />
            <InputField label="Organisation" value={userDetails.organisation} />

            <div className="flex justify-end">
                <button onClick={createNewAPIKey} className="font-medium text-purple-600 hover:text-purple-500 text-center text-sm mt-1">
                    Create New API Key
                </button>
            </div>

            {/* Table body with Keys data displayed in reverse order */}
            <div style={{ maxHeight: '155px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                        <tr>
                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>
                                Created On
                            </th>

                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Key</th>
                        </tr>
                    </thead>
                    <tbody>
                        {APIKeysData.slice(0).reverse().map((key, index) => (
                            <tr key={index}>
                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{key.timestamp}</td>
                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{key.clientApiKey}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}