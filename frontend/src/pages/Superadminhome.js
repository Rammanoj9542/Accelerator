import HeaderSuperadmin from "../components/HeaderSuperadmin";
import SuperadminHome from "../components/SuperadminHome";
import configData from '../constants/config.json';

export default function AdminHomepage() {
    return (
        <>
            <HeaderSuperadmin
                heading={configData.SuperadminHome.Heading}
            />
            <SuperadminHome />
        </>
    )
}