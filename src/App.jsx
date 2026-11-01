import {
    BrowserRouter,
    Routes,
    Route,
    NavLink,
  } from "react-router-dom";
  
  import Home from "./pages/Home";
  import Menu from "./pages/Menu";
  import Shopping from "./pages/Shopping";
  import Progress from "./pages/Progress";
  
  function App() {
    return (
      <BrowserRouter>
        <div className="app-container">
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/shopping" element={<Shopping />} />
              <Route path="/progress" element={<Progress />} />
            </Routes>
          </div>
  
          <nav className="bottom-nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "nav-active"
                  : "nav-link"
              }
            >
              <span>🏠</span>
              <span>Hoy</span>
            </NavLink>
  
            <NavLink
              to="/menu"
              className={({ isActive }) =>
                isActive
                  ? "nav-active"
                  : "nav-link"
              }
            >
              <span>🍽️</span>
              <span>Menú</span>
            </NavLink>
  
            <NavLink
              to="/shopping"
              className={({ isActive }) =>
                isActive
                  ? "nav-active"
                  : "nav-link"
              }
            >
              <span>🛒</span>
              <span>Compra</span>
            </NavLink>
  
            <NavLink
              to="/progress"
              className={({ isActive }) =>
                isActive
                  ? "nav-active"
                  : "nav-link"
              }
            >
              <span>📈</span>
              <span>Peso</span>
            </NavLink>
          </nav>
        </div>
      </BrowserRouter>
    );
  }
  
  export default App;