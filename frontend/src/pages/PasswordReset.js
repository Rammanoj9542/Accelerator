import Header from "../components/Header";
import PasswordReset from "../components/PasswordReset";
import configData from '../constants/config.json';

export default function PasswordResetPage() {
    return (
        <>
            <Header
                heading={configData.PasswordReset.Heading}
                linkName="Back to Login"
                linkUrl="/"
            />
            <PasswordReset />
        </>
    )
}
