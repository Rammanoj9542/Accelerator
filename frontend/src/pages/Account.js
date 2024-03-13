import HeaderUser from "../components/HeaderUser";
import UserAccount from "../components/Account";
import configData from '../constants/config.json';

export default function UserAccountPage() {
    return (
        <>
            <HeaderUser
                heading={configData.UserAccount.Heading}
            />
            <UserAccount />
        </>
    )
}