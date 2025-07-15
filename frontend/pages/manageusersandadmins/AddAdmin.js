import React, { useState } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function AddAdmin({ userEmail, isSuperAdmin }) {
  const [addForm, setAddForm] = useState({ email: "", isSuperAdmin: false });
  const [addStatus, setAddStatus] = useState("");

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddStatus("Adding...");
    try {
      const res = await fetch(`${BASE_API_URL}/addadmins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          email: addForm.email,
          isSuperAdmin: addForm.isSuperAdmin,
          requesterEmail: userEmail,
        }),
      });
      if (res.ok) {
        setAddStatus("Admin added!");
        setAddForm({ email: "", isSuperAdmin: false });
      } else {
        const data = await res.json();
        setAddStatus(data.message || "Failed to add admin");
      }
    } catch {
      setAddStatus("Failed to add admin");
    }
  };

  if (!isSuperAdmin) return null;
  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Add Admin</h3>
      <form onSubmit={handleAddAdmin}>
        <div style={{ marginBottom: 12 }}>
          <label>Email:</label><br />
          <input
            type="email"
            required
            value={addForm.email}
            onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>
            <input
              type="checkbox"
              checked={addForm.isSuperAdmin}
              onChange={e => setAddForm(f => ({ ...f, isSuperAdmin: e.target.checked }))}
            />{" "}
            Is Superadmin
          </label>
        </div>
        <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}>
          Add
        </button>
        <div style={{ marginTop: 10, color: "#1e3c72", fontWeight: 500 }}>{addStatus}</div>
      </form>
    </div>
  );
} 