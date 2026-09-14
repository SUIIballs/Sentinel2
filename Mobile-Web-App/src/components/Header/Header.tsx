import "./Header.css";

import logo from "../../assets/Sentinel.jpeg";

interface HeaderProps {
  onOpenMenu: () => void;
}

/**
 * Header Component
 *
 * Displays Sentinel branding and
 * provides access to the application menu.
 */
const Header = ({
  onOpenMenu,
}: HeaderProps) => {
  return (
    <header
      className="header"
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* ===================================== */}
      {/* CENTERED SENTINEL BRAND                */}
      {/* ===================================== */}

      <div
        className="header-brand"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <img
          src={logo}
          alt="Sentinel Logo"
          className="header-logo"
        />

        <h1 className="header-title">
          SENTINEL
        </h1>

        <p className="header-subtitle">
          Emergency Detection & Alert System
        </p>
      </div>

      {/* ===================================== */}
      {/* TOP RIGHT MENU                         */}
      {/* ===================================== */}

      <button
        type="button"
        className="header-menu-button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          margin: 0,
          border: "1px solid #475569",
          borderRadius: "10px",
          background: "#1e293b",
          color: "white",
          fontSize: "25px",
          lineHeight: 1,
          cursor: "pointer",
          zIndex: 10,
          boxSizing: "border-box",
        }}
      >
        ☰
      </button>
    </header>
  );
};

export default Header;