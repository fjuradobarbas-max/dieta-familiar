import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
const Menu = lazy(() => import("./pages/Menu"));
const Shopping = lazy(() => import("./pages/Shopping"));
const Progress = lazy(() => import("./pages/Progress"));
const Recetas = lazy(() => import("./pages/Recetas"));

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <main className="content">
          <Suspense fallback={<div className="page"><div className="card skeleton" style={{ height: 160, marginTop: 70 }} /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/recetas" element={<Recetas />} />
            <Route path="/marcos" element={<Navigate to="/menu?ver=marcos" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </main>
        <Navbar />
      </div>
    </BrowserRouter>
  );
}

export default App;
