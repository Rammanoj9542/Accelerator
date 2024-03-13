export default function UserHome() {

    // Function to redirect to STT config page
    const handleSTT = (e) => {
        e.preventDefault();
        window.location.href = '/stt';
    }

    // Function to redirect to LLM config page
    const handleLLM = (e) => {
        e.preventDefault();
        window.location.href = '/llm';
    }

    // Function to redirect to RAG config page
    const handleRAG = (e) => {
        e.preventDefault();
        window.location.href = '/rag';
    }

    const buttonStyle = "group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-8";

    return (
        <div>
            <button className={buttonStyle} onClick={handleSTT}>
                STT
            </button>

            <button className={buttonStyle} onClick={handleLLM}>
                LLM
            </button>

            <button className={buttonStyle} onClick={handleRAG}>
                RAG
            </button>
        </div>
    )
}