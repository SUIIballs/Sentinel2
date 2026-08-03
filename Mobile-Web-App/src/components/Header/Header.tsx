import "./Header.css";
import logo from "../../assets/Sentinel.jpeg";

/**
 * Header Component
 *
 * Displays the Sentinel branding.
 */
const Header = () => {
  return (
    <header className="header">
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
    </header>
  );
};

export default Header;