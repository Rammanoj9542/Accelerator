import { useState } from 'react';
import { registrationFields_Admin } from "../constants/formFields";
import Input from "./Input";

// Define form fields based on the imported registrationFields from constants
const fields = registrationFields_Admin;

// Initialize the form state with empty values for each field
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function AdminHome() {
    // Declare and initialize state variables
    const [signupState, setSignupState] = useState(fieldsState); // Form field values

    const [divNumber, setDivNumber] = useState(0); // State to track the form number

    // State to control flash messages
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    // Function to handle flash messages
    const handleFlashMessage = (text, success) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), 3000);
    };

    // Function to handle user registration button click
    const handleUserRegButton = () => {
        // window.location.href = '/userregistration';
        setDivNumber(1);
    }

    // Function to handle dashboard button click
    const handleDashboardButton = () => {
        alert("Page is not yet ready");
        // window.location.href = '/admindashboard';
    }

    // Function to handle input field changes
    const handleChange = (e) => {
        if (e.target.id === "contactnumber") {
            const onlyNums = e.target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            setSignupState({ ...signupState, [e.target.id]: onlyNums });
        } else {
            setSignupState({ ...signupState, [e.target.id]: e.target.value });
        }
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!signupState.firstname || !signupState.lastname || !signupState.email_address || !signupState.username || !signupState.password || !signupState.contactnumber) {
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
                const apiResponse = await fetch("/generateclientApiKeyWhileRegistration", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userid: responseData.userid }),
                });

                const apiKeyData = await apiResponse.json();
                if (apiResponse.ok) {
                    handleFlashMessage(apiKeyData.message, true);
                } else {
                    handleFlashMessage(apiKeyData.message, false);
                }

                handleFlashMessage(responseData.message, true);
                resetForm();
            } else {
                handleFlashMessage(responseData.message, false);
            }
        } catch (error) {
            console.error('Error:', error.message);
            handleFlashMessage("An unknown error occurred. Please try again later.", false);
        }
    };

    // Function to reset the form to its initial state
    const resetForm = () => {
        const signupState = {};
        fields.forEach(field => signupState[field.id] = '');
        setSignupState(signupState);
        setDivNumber(0);
    }

    // CSS class for buttons
    const buttonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-5";

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold'
    };


    return (
        <div>

            {/* Buttons for user registration and dashboard */}
            <div className="flex justify-center mt-4" style={{ marginBottom: "10px" }}>
                <button className="group relative flex py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500" onClick={handleUserRegButton}>
                    User Registration
                </button>
                <button className="group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ml-10" onClick={handleDashboardButton}>
                    Dashboard
                </button>
            </div>

            {/* Displaying success flash message */}
            {flashMessage.success && (
                <div id="successFlashMsg">{flashMessage.text}</div>
            )}

            {/* Displaying failure flash message */}
            {flashMessage.failure && (
                <div id="failFlashMsg">{flashMessage.text}</div>
            )}

            {divNumber === 1 && (
                <div>
                    <h1 style={h1Style}>User Registration</h1>
                    <form className="mt-5 space-y-6">
                        <div className="">
                            {fields.map((field) => (
                                <Input
                                    key={field.id}
                                    handleChange={handleChange}
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
                            ))}
                        </div>
                    </form>

                    <button onClick={handleSubmit} className={buttonClass}>
                        Register
                    </button>
                </div>
            )}

        </div>
    )
}