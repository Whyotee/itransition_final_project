import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CvsPage({ user }) {
  const [cvs, setCvs] = useState([]);
  const [positions, setPositions] = useState([]);
  const [positionId, setPositionId] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetch("/api/cvs")
      .then((res) => {
        if (!res.ok) return;
        return res.json()})
      .then((data) => {
        if ((data)) setCvs(data);
      });
  }  

  useEffect(() => {
    if (!user) return;
    load();
    fetch("/api/positions")
      .then((res) => res.json())
      .then((data) => setPositions(data));
  }, [user]);

  function createCv(e) {
    e.preventDefault();
    setError("");
    fetch("/api/cvs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionId: Number(positionId) }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setPositionId("");
      load();
    });
  }

  if (!user) {
    return <p className="text-muted">Log in (Home tab) to build a CV.</p>;
  }

  return (
    <div>
      <h1>My CVs</h1>

      <form onSubmit={createCv} className="row g-2 my-3">
        <div className="col-auto">
          <select
            className="form-select"
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            required
          >
            <option value="">Pick a position…</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" type="submit">
            Create CV
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <ul className="list-group">
        {cvs.map((cv) => (
          <li key={cv.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{cv.position.title}</span>
            <Link className="btn btn-sm btn-outline-primary" to={`/cvs/${cv.id}`}>
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
