import React, { useEffect, useState } from "react";
import { BASE_API_URL } from "../utils/apiurl";
import { FaBullhorn, FaBookOpen } from "react-icons/fa";

const CBSEUpdatesPage = () => {
  const [cbseUpdates, setCbseUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${BASE_API_URL}/cbse-updates`)
      .then(res => res.json())
      .then(data => {
        setCbseUpdates(data.updates || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch CBSE updates.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{
        fontWeight: 700,
        fontSize: 32,
        marginBottom: 28,
        color: "#1e3c72",
        letterSpacing: 1,
        textAlign: "center"
      }}>
        <FaBullhorn style={{ marginRight: 12, color: "#ff0080", fontSize: 28, verticalAlign: "middle" }} />
        CBSE Updates
      </h2>
      {loading ? (
        <div style={{ textAlign: "center", color: "#1e3c72", fontSize: 20, marginTop: 40 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "#c0392b", textAlign: "center", fontSize: 18 }}>{error}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {cbseUpdates.length === 0 && (
            <div style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(30,60,114,0.08)",
              padding: 32,
              textAlign: "center",
              color: "#888",
              fontSize: 18
            }}>
              No updates found.
            </div>
          )}
          {cbseUpdates.map((u, idx) => (
            <a
              key={idx}
              href={u.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 12px rgba(30,60,114,0.10)",
                padding: "20px 28px",
                textDecoration: "none",
                transition: "box-shadow 0.18s, background 0.18s",
                borderLeft: "5px solid #1e3c72",
                marginBottom: 2,
                cursor: "pointer",
                position: "relative"
              }}
              onMouseOver={e => e.currentTarget.style.background = "#f7fafd"}
              onMouseOut={e => e.currentTarget.style.background = "#fff"}
            >
              <span style={{
                fontSize: 22,
                color: "#ff0080",
                flexShrink: 0,
                marginRight: 2
              }}>
                {u.link && (u.link.endsWith(".pdf") || u.link.endsWith(".PDF"))
                  ? <FaBookOpen />
                  : <FaBullhorn />}
              </span>
              <span style={{
                fontWeight: 600,
                fontSize: 17,
                color: "#1e3c72",
                flex: 1,
                lineHeight: 1.5
              }}>
                {u.title}
              </span>
              <span style={{
                fontSize: 15,
                color: "#888",
                marginLeft: 12,
                flexShrink: 0
              }}>
                View &rarr;
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default CBSEUpdatesPage; 