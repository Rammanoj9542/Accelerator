import HeaderUser from "../components/HeaderUser";
import RAG from "../components/RAG";
import configData from '../constants/config.json';

export default function RAGPage() {
    return (
        <>
            <HeaderUser
                heading={configData.RAG.Heading}
            />
            <RAG />
        </>
    )
}