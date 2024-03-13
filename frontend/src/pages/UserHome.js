import HeaderUser from "../components/HeaderUser";
import UserHome from "../components/UserHome";
import configData from '../constants/config.json';

export default function UserHomepage() {
    return (
        <>
            <HeaderUser
                heading={configData.Userhome.Heading}
            />
            <UserHome />
        </>
    )
}