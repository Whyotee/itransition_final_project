import { useEffect, useState } from "react";
import { isAdmin } from "../roles.js";

const ROLES = ["CANDIDATE", "RECRUITER", "ADMIN"];

export default function AdminUsersPage({ user }) {
  const [users, setUsers] = useState([]);

  function load() {
    fetch("/api/users")
      .then((res) => {
        if (!res.ok) return; 
        return res.json();
      })
      .then((data) => {
        if (data) setUsers(data);
      });
  }

  useEffect(load, []);

  function changeRole(id, role) {
    fetch(`/api/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }).then(load);
  }

  if (!isAdmin(user)) {
    return <p className="text-muted">Admins only.</p>;
  }

  return (
    <div>
      <h1>Users</h1>
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th style={{ width: 200 }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email || "—"}</td>
              <td>
                <select
                  className="form-select form-select-sm"
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
