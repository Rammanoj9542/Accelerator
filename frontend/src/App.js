import './App.css';
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import LoginPage from './pages/Login';
import PasswordResetPage from './pages/PasswordReset';
import SuperadminHomePage from './pages/Superadminhome';
import AdminHomePage from './pages/AdminHome';
import UserHomePage from './pages/UserHome';
import STTPage from './pages/STT';
import LLMPage from './pages/LLM';
import RAGPage from './pages/RAG';
import UserAccountPage from './pages/Account';

function App() {
  return (
    <div className="min-h-full h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/passwordreset" element={<PasswordResetPage />} />
            <Route path="/superadminhome" element={<SuperadminHomePage />} />
            <Route path="/adminhome" element={<AdminHomePage />} />
            <Route path="/userhome" element={<UserHomePage />} />
            <Route path="/stt" element={<STTPage />} />
            <Route path="/llm" element={<LLMPage />} />
            <Route path="/rag" element={<RAGPage />} />
            <Route path="/account" element={<UserAccountPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;