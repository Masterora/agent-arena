import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ToastProvider } from "./contexts/ToastContext";
import Home from "./pages/Home";
import Strategies from "./pages/Strategies";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";

function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}

export default App;
