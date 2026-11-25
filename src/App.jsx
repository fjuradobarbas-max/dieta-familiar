import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Shopping from "./pages/Shopping";
import Progress from "./pages/Progress";
import Recetas from "./pages/Recetas";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/recetas" element={<Recetas />} />
            <Route path="/marcos" element={<Navigate to="/menu?ver=marcos" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Navbar />
      </div>
    </BrowserRouter>
  );
}

export default App;
