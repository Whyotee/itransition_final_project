import { useEffect, useState } from "react";

const TYPES = ["TEXT", "NUMBER", "DATE", "BOOLEAN"];
const TYPE_LABELS = { TEXT: "Text", NUMBER: "Number", DATE: "Date", BOOLEAN: "Yes/No" };

export default function AttributesPage({ user }) {
  const [attributes, setAttributes] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("TEXT");

  function load() {
    fetch("/api/attributes")
      .then((res) => res.json())
      .then(setAttributes);
  }

  useEffect(load, []); 

  function addAttribute(e) {
    e.preventDefault();
    fetch("/api/attributes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
    }).then(() => {
      setName("");
      setType("TEXT");
      load();
    });
  }

  return (
    <div>
      <h1>Attributes</h1>

      {user ? (
        <form onSubmit={addAttribute} className="row g-2 my-3">
          <div className="col-auto">
            <input
              className="form-control"
              placeholder="Attribute name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col-auto">
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" type="submit">
              Add
            </button>
          </div>
        </form>
      ) : (
        <p className="text-muted my-3">Log in (Home tab) to add attributes.</p>
      )}

      <ul className="list-group">
        {attributes.map((a) => (
          <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{a.name}</span>
            <span className="badge bg-secondary">{TYPE_LABELS[a.type]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
