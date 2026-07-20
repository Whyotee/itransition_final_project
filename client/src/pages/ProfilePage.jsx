import { useEffect, useState } from "react";

function AttributeInput({ attr, value, onChange }) {
  if (attr.type === "BOOLEAN") {
    return (
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
        />
      </div>
    );
  }

  const inputType = attr.type === "NUMBER" ? "number" : attr.type === "DATE" ? "date" : "text";
  return (
    <input
      className="form-control"
      type={inputType}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function ProfilePage({ user }) {
  const [attributes, setAttributes] = useState([]);
  const [values, setValues] = useState({}); 
  const [saved, setSaved] = useState(false);


  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/attributes").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([attrs, profileValues]) => {
      setAttributes(attrs);
      const map = {};
      profileValues.forEach((v) => (map[v.attributeId] = v.value));
      setValues(map);
    });
  }, [user]);

  function setValue(attributeId, value) {
    setValues((prev) => ({ ...prev, [attributeId]: value }));
    setSaved(false);
  }

  function save(e) {
    e.preventDefault();
    const payload = {
      values: Object.entries(values).map(([attributeId, value]) => ({
        attributeId: Number(attributeId),
        value,
      })),
    };
    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => setSaved(true));
  }

  if (!user) return <p className="text-muted">Please log in (Home tab) to edit your profile.</p>;

  if (attributes.length === 0) {
    return <p className="text-muted">No attributes yet. Add some on the Attributes tab first.</p>;
  }

  return (
    <div>
      <h1>My profile</h1>
      <form onSubmit={save} className="mt-3" style={{ maxWidth: 420 }}>
        {attributes.map((attr) => (
          <div className="mb-3" key={attr.id}>
            <label className="form-label">{attr.name}</label>
            <AttributeInput
              attr={attr}
              value={values[attr.id]}
              onChange={(v) => setValue(attr.id, v)}
            />
          </div>
        ))}
        <button className="btn btn-primary" type="submit">
          Save
        </button>
        {saved && <span className="text-success ms-2">Saved!</span>}
      </form>
    </div>
  );
}
