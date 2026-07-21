import { useEffect, useState } from "react";

export default function PositionsPage({ user }) {
  const [positions, setPositions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function load() {
    fetch("/api/positions")
      .then((res) => res.json())
      .then(setPositions);
  }

  useEffect(load, []);

  function addPosition(e) {
    e.preventDefault();
    fetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    }).then(() => {
      setTitle("");
      setDescription("");
      load();
    });
  }

  return (
    <div>
      <h1>Positions</h1>

      {user ? (
        <form onSubmit={addPosition} className="my-3" style={{ maxWidth: 480 }}>
          <input
            className="form-control mb-2"
            placeholder="Position title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="form-control mb-2"
            placeholder="Description (optional)"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Create position
          </button>
        </form>
      ) : (
        <p className="text-muted my-3">Log in (Home tab) to create positions.</p>
      )}

      <ul className="list-group">
        {positions.map((p) => (
          <li key={p.id} className="list-group-item">
            <div className="fw-bold">{p.title}</div>
            {p.description && <div>{p.description}</div>}
            <small className="text-muted">Created by {p.createdBy.name}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
