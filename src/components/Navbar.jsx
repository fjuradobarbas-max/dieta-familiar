import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", emoji: "🏠", label: "Hoy" },
  { to: "/menu", emoji: "🍽️", label: "Menú" },
  { to: "/shopping", emoji: "🛒", label: "Compra" },
  { to: "/progress", emoji: "📈", label: "Peso" },
];

function Navbar() {
  return (
    <nav className="bottom-nav">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === "/"}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <span className="nav-emoji">{l.emoji}</span>
          <span className="nav-label">{l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default Navbar;
