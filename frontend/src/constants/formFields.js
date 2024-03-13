const loginFields = [
    {
        labelText: "Username",
        labelFor: "username",
        id: "username",
        name: "username",
        type: "text",
        autoComplete: "username",
        isRequired: true,
        placeholder: "Username",
        maxLength: 30
    },
    {
        labelText: "Password",
        labelFor: "password",
        id: "password",
        name: "password",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "Password",
        maxLength: 20
    }
]

const passwordResetFields = [
    {
        labelText: "Email address",
        labelFor: "email-address",
        id: "emailAddress",
        name: "email",
        type: "email",
        autoComplete: "email",
        isRequired: true,
        placeholder: "Email address",
        maxLength: 40
    }
]

const otpVerificationFields = [
    {
        labelText: "OTP",
        labelFor: "otp",
        id: "otp",
        name: "otp",
        type: "number",
        autoComplete: "otp",
        isRequired: true,
        placeholder: "OTP",
        minLength: 6,
        maxLength: 6
    }
]

const passwordUpdateFields = [
    {
        labelText: "Password",
        labelFor: "password",
        id: "password",
        name: "password",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "New Password",
        maxLength: 20
    },
    {
        labelText: "Confirm Password",
        labelFor: "confirm-password",
        id: "confirmPassword",
        name: "confirm-password",
        type: "password",
        autoComplete: "confirm-password",
        isRequired: true,
        placeholder: "Confirm New Password",
        maxLength: 20
    }
]

const registrationFields_Superadmin = [
    {
        labelText: "Firstname",
        labelFor: "firstname",
        id: "firstname",
        name: "firstname",
        type: "text",
        autoComplete: "firstname",
        isRequired: true,
        placeholder: "First name",
        maxLength: 30
    },
    {
        labelText: "Lastname",
        labelFor: "lastname",
        id: "lastname",
        name: "lastname",
        type: "text",
        autoComplete: "lastname",
        isRequired: true,
        placeholder: "Last name",
        maxLength: 30
    },
    {
        labelText: "Email address",
        labelFor: "email-address",
        id: "email_address",
        name: "email",
        type: "email",
        autoComplete: "email",
        isRequired: true,
        placeholder: "Email address",
        maxLength: 40
    },
    {
        labelText: "Username",
        labelFor: "username",
        id: "username",
        name: "username",
        type: "text",
        autoComplete: "username",
        isRequired: true,
        placeholder: "Username",
        maxLength: 30
    },
    {
        labelText: "Password",
        labelFor: "password",
        id: "password",
        name: "password",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "Password",
        maxLength: 20
    },
    {
        labelText: "Contactnumber",
        labelFor: "contactnumber",
        id: "contactnumber",
        name: "contactnumber",
        type: "text",
        autoComplete: "contactnumber",
        isRequired: true,
        placeholder: "Contact Number",
        minLength: 10,
        maxLength: 10
    },
    {
        labelText: "Organisation",
        labelFor: "organisation",
        id: "organisation",
        name: "organisation",
        type: "select", // Use "select" for dropdown
        isRequired: true
    }
]

const registrationFields_Admin = [
    {
        labelText: "Firstname",
        labelFor: "firstname",
        id: "firstname",
        name: "firstname",
        type: "text",
        autoComplete: "firstname",
        isRequired: true,
        placeholder: "First name",
        maxLength: 30
    },
    {
        labelText: "Lastname",
        labelFor: "lastname",
        id: "lastname",
        name: "lastname",
        type: "text",
        autoComplete: "lastname",
        isRequired: true,
        placeholder: "Last name",
        maxLength: 30
    },
    {
        labelText: "Email address",
        labelFor: "email-address",
        id: "email_address",
        name: "email",
        type: "email",
        autoComplete: "email",
        isRequired: true,
        placeholder: "Email address",
        maxLength: 40
    },
    {
        labelText: "Username",
        labelFor: "username",
        id: "username",
        name: "username",
        type: "text",
        autoComplete: "username",
        isRequired: true,
        placeholder: "Username",
        maxLength: 30
    },
    {
        labelText: "Password",
        labelFor: "password",
        id: "password",
        name: "password",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "Password",
        maxLength: 20
    },
    {
        labelText: "Contactnumber",
        labelFor: "contactnumber",
        id: "contactnumber",
        name: "contactnumber",
        type: "text",
        autoComplete: "contactnumber",
        isRequired: true,
        placeholder: "Contact Number",
        minLength: 10,
        maxLength: 10
    }
]

const STTNewConfigFields = [
    {
        labelText: "Select Mode",
        labelFor: "mode",
        id: "mode",
        name: "mode",
        type: "select", // Use "select" for dropdown
        isRequired: true,
        options: [
            { value: "", label: "Select Mode" }, // Default option
            { value: "transcribe", label: "Transcribe" },
            { value: "translate", label: "Translate" }
        ]
    },
    {
        labelText: "Select Model",
        labelFor: "model",
        id: "model",
        name: "model",
        type: "select", // Use "select" for dropdown
        isRequired: true,
        options: [
            { value: "", label: "Select Model" }, // Default option
            { value: "tiny", label: "Tiny" },
            { value: "base", label: "Base" },
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" }
        ]
    }
]

export { loginFields, passwordResetFields, otpVerificationFields, passwordUpdateFields, registrationFields_Superadmin, registrationFields_Admin, STTNewConfigFields }