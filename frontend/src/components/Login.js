import { useState, useEffect } from 'react';
import { loginFields } from "../constants/formFields";
import Input from "./Input";
// import FormExtra from "./FormExtra";
import { AES } from 'crypto-js';

// Define form fields based on the imported loginFields from constants
const fields = loginFields;

// Initialize the form state with empty values for each field
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function Login() {
    // Declare and initialize state variables
    const [loginState, setLoginState] = useState(fieldsState);
    const [userTimezone, setUserTimezone] = useState('');
    // State to control flash messages
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    useEffect(() => {
        // Function to get the user's time zone
        const getUserTimezone = () => {
            try {
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                setUserTimezone(timezone || 'UTC'); // Set UTC as default if timezone is not available
            } catch (error) {
                console.error('Error getting user time zone:', error);
                setUserTimezone('UTC'); // Set UTC as default in case of an error
            }
        };

        // Call the function when the component mounts
        getUserTimezone();
    }, []);

    // Function to handle flash messages
    const handleFlashMessage = (text, success) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), 2000);
    };

    // Function to handle input field changes
    const handleChange = (e) => {
        setLoginState({ ...loginState, [e.target.id]: e.target.value });
    }

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if required fields are entered
        if (!loginState.username && !loginState.password) {
            handleFlashMessage("Please input all fields", false, 2000);
            return;
        } else if (!loginState.username) {
            handleFlashMessage("Please input the username", false, 2000);
            return;
        } else if (!loginState.password) {
            handleFlashMessage("Please input the password", false, 2000);
            return;
        } else {
            authenticateUser();
        }
    }

    // Handle Login API Integration here
    const authenticateUser = () => {
        // Extract username and password from the form state
        const usernameInput = loginState.username.toLowerCase();
        const passwordInput = loginState.password;

        // Generate a random encryption key and initialization vector (IV)
        const key = "kojsnhfitonhsuth";
        const iv = "odbshirnkofgfffs";

        // Encrypt the username and password
        const encryptedUsername = AES.encrypt(usernameInput, key, { iv: iv });
        const encryptedPassword = AES.encrypt(passwordInput, key, { iv: iv });

        // Convert the encrypted data to base64-encoded strings
        const encryptedUsernameStr = encryptedUsername.toString();
        const encryptedPasswordStr = encryptedPassword.toString();

        // Send the encrypted credentials to the server
        fetch("/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: encryptedUsernameStr,
                password: encryptedPasswordStr,
                userTimezone: userTimezone
            }),
        })
            .then(async (response) => {
                if (response.ok) {
                    // If the login is successful, redirect to the corresponding user role's home page
                    const userData = await response.json();
                    window.location.href = `/${userData.role}home`;
                } else if (response.status === 401) {
                    // If the login is unsuccessful, show a flash message and reset the form
                    // const userData = await response.json();
                    handleFlashMessage("Invalid credentials", false);
                    resetForm();
                } else {
                    handleFlashMessage("Internal server error", false);
                    window.location.href = '/';
                }
            })
            .catch((error) => {
                console.error("Error authenticating user:", error);
                handleFlashMessage("Error authenticating user", false);
            });
    };

    // Function to reset the form to its initial state
    const resetForm = () => {
        const loginState = {};
        fields.forEach(field => loginState[field.id] = '');
        setLoginState(loginState);
    }


    return (
        <div>

            {/* Displaying failure flash message */}
            {flashMessage.failure && (
                <div id="failFlashMsg">
                    {flashMessage.text}
                </div>
            )}

            {/* Login form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="-space-y-px">
                    {/* Map over form fields and render Input components for each */}
                    {fields.map(field =>
                        <Input
                            key={field.id}
                            handleChange={handleChange}
                            value={loginState[field.id]}
                            labelText={field.labelText}
                            labelFor={field.labelFor}
                            id={field.id}
                            name={field.name}
                            type={field.type}
                            isRequired={field.isRequired}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                        />
                    )}
                </div>

                {/* Additional form components (e.g., forgot password link) */}
                {/* <FormExtra /> */}

                {/* Login button */}
                <button className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-10" onClick={handleSubmit}>Login</button>
            </form>

        </div>
    )
}
