import HeaderUser from "../components/HeaderUser";
import STT from "../components/STT";
import configData from '../constants/config.json';

export default function STTPage() {
    return (
        <>
            <HeaderUser
                heading={configData.STT.Heading}
            />
            <STT />
        </>
    )
}