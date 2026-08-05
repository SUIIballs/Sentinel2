import { useState } from "react";

import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  const [page, setPage] = useState<"home" | "history">(
    "home"
  );

  return page === "home" ? (
    <HomePage
      onViewHistory={() => setPage("history")}
    />
  ) : (
    <HistoryPage
      onBack={() => setPage("home")}
    />
  );
}

export default App;