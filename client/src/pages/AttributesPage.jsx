import { useEffect, useState } from "react";

const TYPES = ["TEXT", "NUMBER", "DATE", "BOOLEAN"];
const TYPE_LABELS = { TEXT: "Text", NUMBER: "Number", DATE: "Date", BOOLEAN: "Yes/No" };

const CATEGORIES = ["CERTIFICATION", "DOMAIN_KNOWLEDGE", "PERSONAL_INFORMATION", "SOFT_SKILLS"];
const CATEGORY_LABELS = {
  CERTIFICATION: "Certification",
  DOMAIN_KNOWLEDGE: "Domain Knowledge",
  PERSONAL_INFORMATION: "Personal Information",
  SOFT_SKILLS: "Soft Skills",
};

export default function AttributesPage({ user }) {
  const [attributes, setAttributes] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("TEXT");
  const [category, setCategory] = useState("PERSONAL_INFORMATION");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]); 
  const [editingId, setEditingId] = useState(null); 

  function load() {
    fetch("/api/attributes")
      .then((res) => res.json())
      .then(setAttributes);
  }

  useEffect(load, []);

  function addAttribute(e) {
    e.preventDefault();
    setError("");
    fetch("/api/attributes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, category }),
    }).then(async (res) => {
      if (!res.ok) {
        setError((await res.json()).error);
        return;
      }
      setName("");
      setType("TEXT");
      setCategory("PERSONAL_INFORMATION");
      load();
    });
  }

  function toggle(id) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function deleteSelected() {
    if (!window.confirm(`Delete ${selected.length} attribute(s)? Saved values will also be removed.`)) return;
    Promise.all(selected.map((id) => fetch(`/api/attributes/${id}`, { method: "DELETE" }))).then(() => {
      setSelected([]);
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
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
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
        <p className="text-muted my-3">Log in (Home tab) to manage attributes.</p>
      )}

      {error && <div className="alert alert-danger py-2">{error}</div>}

      
      {user && (
        <div className="d-flex gap-2 align-items-center mb-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={selected.length !== 1}
            onClick={() => setEditingId(selected[0])}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            disabled={selected.length === 0}
            onClick={deleteSelected}
          >
            Delete
          </button>
        </div>
      )}

      <ul className="list-group">
        {attributes.map((a) =>
          editingId === a.id ? (
            <AttributeEditRow
              key={a.id}
              attr={a}
              onDone={() => {
                setEditingId(null);
                setSelected([]);
                setError("");
                load();
              }}
              onError={setError}
            />
          ) : (
            <li
              key={a.id}
              className="list-group-item d-flex align-items-center gap-2"
            >
              {user && !a.isBuiltIn && (
                <input
                  type="checkbox"
                  className="form-check-input mt-0"
                  checked={selected.includes(a.id)}
                  onChange={() => toggle(a.id)}
                />
              )}
              <span>
                {a.name} <span className="badge bg-info text-dark">{CATEGORY_LABELS[a.category]}</span>{" "}
                <span className="badge bg-secondary">{TYPE_LABELS[a.type]}</span>{" "}
                {a.isBuiltIn && <span className="badge bg-dark">Built-in</span>}
              </span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}


function AttributeEditRow({ attr, onDone, onError }) {
  const [name, setName] = useState(attr.name);
  const [type, setType] = useState(attr.type);
  const [category, setCategory] = useState(attr.category);

  function save() {
    fetch(`/api/attributes/${attr.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, category }),
    }).then(async (res) => {
      if (!res.ok) {
        onError((await res.json()).error);
        return;
      }
      onDone();
    });
  }

  return (
    <li className="list-group-item">
      <div className="row g-2">
        <div className="col-auto">
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="col-auto">
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
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
        <div className="col-auto d-flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={save}>
            Save
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={onDone}>
            Cancel
          </button>
        </div>
      </div>
    </li>
  );
}
