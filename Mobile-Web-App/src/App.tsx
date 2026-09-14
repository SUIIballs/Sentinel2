import { useState } from "react";

import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import EmergencyContactsPage from "./pages/EmergencyContactsPage";
import AddEmergencyContactPage from "./pages/AddEmergencyContactPage";

import Menu from "./components/Menu/Menu";

type Page =
  | "home"
  | "history"
  | "contacts"
  | "add-contact";

function App() {
  const [page, setPage] =
    useState<Page>("home");

  const [menuOpen, setMenuOpen] =
    useState(false);

  const openMenu = () => {
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const goHome = () => {
    setPage("home");
    closeMenu();
  };

  const openHistory = () => {
    setPage("history");
    closeMenu();
  };

  const openContacts = () => {
    setPage("contacts");
    closeMenu();
  };

  const openAddContact = () => {
    setPage("add-contact");
    closeMenu();
  };

  return (
    <>
      <Menu
        isOpen={menuOpen}
        onClose={closeMenu}
        onAddContact={
          openAddContact
        }
        onViewContacts={
          openContacts
        }
        onViewHistory={
          openHistory
        }
      />

      {page === "home" && (
        <HomePage
          onOpenMenu={
            openMenu
          }
        />
      )}

      {page === "history" && (
        <HistoryPage
          onBack={
            goHome
          }
        />
      )}

      {page === "contacts" && (
        <EmergencyContactsPage
          onBack={
            goHome
          }
          onAddContact={
            openAddContact
          }
        />
      )}

      {page === "add-contact" && (
        <AddEmergencyContactPage
          onBack={
            openContacts
          }
        />
      )}
    </>
  );
}

export default App;