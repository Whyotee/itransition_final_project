import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function formatValue(type, value) {
  if (type === "BOOLEAN") return value === "true" ? "Yes" : "No";
  return value || "—";
}

export default function CvViewPage() {
  const { id } = useParams();
  const [cv, setCv] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/cvs/${id}`).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setCv(data);
    });
  }, [id]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!cv) return <p>Loading…</p>;

  return (
    <div>
      <h1>{cv.position.title}</h1>
      {cv.position.description && <p className="text-muted">{cv.position.description}</p>}
      <p>
        Candidate: <strong>{cv.owner.name}</strong>
      </p>

      <h2 className="h5 mt-4">Details</h2>
      {cv.values.length === 0 ? (
        <p className="text-muted">No profile fields filled in yet. Add some on the Profile tab.</p>
      ) : (
        <table className="table">
          <tbody>
            {cv.values.map((v) => (
              <tr key={v.attributeId}>
                <th style={{ width: 240 }}>{v.name}</th>
                <td>{formatValue(v.type, v.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
