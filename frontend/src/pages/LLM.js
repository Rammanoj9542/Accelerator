import HeaderUser from "../components/HeaderUser";
import LLM from "../components/LLM";
import configData from '../constants/config.json';

export default function LLMPage() {
    return (
        <>
            <HeaderUser
                heading={configData.LLM.Heading}
            />
            <LLM />
        </>
    )
}