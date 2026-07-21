import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AttributesPage from "./pages/AttributesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import PositionsPage from "./pages/PositionsPage.jsx";

export default function App() {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => setUser(null));
  }

  if (loading) return <div className="container py-4">Loading...</div>;

  return (
    <div className="container py-4">
      <nav className="d-flex gap-3 mb-4">
        <Link to="/">Home</Link>
        <Link to="/attributes">Attributes</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/positions">Positions</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={logout} />} />
        <Route path="/attributes" element={<AttributesPage user={user} />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/positions" element={<PositionsPage user={user} />} />
      </Routes>
    </div>
  );
}
