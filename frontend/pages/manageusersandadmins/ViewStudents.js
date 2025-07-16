import React, { useState } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function ViewStudents({ userEmail, isSuperAdmin }) {
  const [studentViewMode, setStudentViewMode] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allStatus, setAllStatus] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [studentStatus, setStudentStatus] = useState("");
  const [classInput, setClassInput] = useState("");
  const [classStudents, setClassStudents] = useState([]);
  const [classStatus, setClassStatus] = useState("");

  const handleStudentSearch = async (e) => {
    e.preventDefault();
    setStudentStatus("Searching...");
    setSearchedStudent(null);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/find-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: searchStudent, requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedStudent(data.user);
        setStudentStatus("");
      } else {
        const data = await res.json();
        setSearchedStudent(null);
        setStudentStatus(data.message || "Student not found");
      }
    } catch {
      setSearchedStudent(null);
      setStudentStatus("Error searching student");
    }
  };

  const handleViewAllStudents = async () => {
    setAllStatus("Loading...");
    setAllStudents([]);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/all-students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setAllStudents(data.students || []);
        setAllStatus("");
      } else {
        setAllStatus("Failed to fetch students");
      }
    } catch {
      setAllStatus("Failed to fetch students");
    }
  };

  const handleViewByClass = async (e) => {
    e.preventDefault();
    setClassStatus("Loading...");
    setClassStudents([]);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/students-by-class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ class: classInput, requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setClassStudents(data.students || []);
        setClassStatus("");
      } else {
        const data = await res.json();
        setClassStudents([]);
        setClassStatus(data.message || "No students found for this class");
      }
    } catch {
      setClassStudents([]);
      setClassStatus("Failed to fetch students");
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>View Student</h3>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <button onClick={() => { setStudentViewMode('all'); handleViewAllStudents(); }} style={{ padding: "8px 18px", borderRadius: 6, background: studentViewMode === 'all' ? "#1e3c72" : "#eee", color: studentViewMode === 'all' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View All Students</button>
        <button onClick={() => setStudentViewMode('search')} style={{ padding: "8px 18px", borderRadius: 6, background: studentViewMode === 'search' ? "#1e3c72" : "#eee", color: studentViewMode === 'search' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search by Email</button>
        <button onClick={() => setStudentViewMode('class')} style={{ padding: "8px 18px", borderRadius: 6, background: studentViewMode === 'class' ? "#1e3c72" : "#eee", color: studentViewMode === 'class' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View by Class</button>
      </div>
      {studentViewMode === 'all' && (
        <div>
          {allStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{allStatus}</div>}
          {allStudents.length > 0 && (
            <div style={{ fontWeight: 600, color: '#1e3c72', marginBottom: 10 }}>Total number of students = {allStudents.length}</div>
          )}
          {allStudents.length > 0 ? (
            <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
              {allStudents.map((student, idx) => (
                <div key={student._id || idx} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <img
                      src={student.photo || '/default-avatar.png'}
                      alt="Profile"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                    />
                  </div>
                  {student.name && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                      <span style={{ color: "#222", fontWeight: 500 }}>{student.name}</span>
                    </div>
                  )}
                  {Object.entries(student).map(([key, value]) => {
                    if (key === "guardian" && Array.isArray(value) && value.length > 0) {
                      return (
                        <div key={key} style={{ marginTop: 8 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Guardians:</span>
                          <table style={{ width: '100%', marginTop: 4, background: '#f7fafd', borderRadius: 8 }}>
                            <thead>
                              <tr>
                                <th style={{ padding: 4, textAlign: 'left' }}>Name</th>
                                <th style={{ padding: 4, textAlign: 'left' }}>Email</th>
                                <th style={{ padding: 4, textAlign: 'left' }}>Role</th>
                              </tr>
                            </thead>
                            <tbody>
                              {value.map((g, idx) => (
                                <tr key={idx}>
                                  <td style={{ padding: 4 }}>{g.name || "-"}</td>
                                  <td style={{ padding: 4 }}>{g.email}</td>
                                  <td style={{ padding: 4 }}>{g.role}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds" && key !== "name" && key !== "profileVisibility") {
                      return (
                        <div key={key} style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                          <span style={{ color: "#222" }}>{String(value) || "-"}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          ) : !allStatus && <div>No students found.</div>}
        </div>
      )}
      {studentViewMode === 'search' && (
        <>
          <form onSubmit={handleStudentSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input type="email" placeholder="Enter student email (exact match)" value={searchStudent} onChange={e => {
              setSearchStudent(e.target.value);
              if (e.target.value === "") setSearchedStudent(null);
            }} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
          </form>
          {studentStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{studentStatus}</div>}
          {searchedStudent && (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 18 }}>
              <h4 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#1e3c72" }}>Student Details</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <img
                    src={searchedStudent.photo || '/default-avatar.png'}
                    alt="Profile"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                  />
                </div>
                {searchedStudent.name && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                    <span style={{ color: "#222", fontWeight: 500 }}>{searchedStudent.name}</span>
                  </div>
                )}
                {Object.entries(searchedStudent).map(([key, value]) => {
                  if (key === "guardian" && Array.isArray(value) && value.length > 0) {
                    return (
                      <div key={key} style={{ marginTop: 8 }}>
                        <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Guardians:</span>
                        <table style={{ width: '100%', marginTop: 4, background: '#f7fafd', borderRadius: 8 }}>
                          <thead>
                            <tr>
                              <th style={{ padding: 4, textAlign: 'left' }}>Name</th>
                              <th style={{ padding: 4, textAlign: 'left' }}>Email</th>
                              <th style={{ padding: 4, textAlign: 'left' }}>Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {value.map((g, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: 4 }}>{g.name || "-"}</td>
                                <td style={{ padding: 4 }}>{g.email}</td>
                                <td style={{ padding: 4 }}>{g.role}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds" && key !== "name" && key !== "profileVisibility") {
                    return (
                      <div key={key} style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                        <span style={{ color: "#222" }}>{String(value) || "-"}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </>
      )}
      {studentViewMode === 'class' && (
        <div>
          <form onSubmit={handleViewByClass} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input type="text" placeholder="Enter class (e.g. 10, 12A, etc.)" value={classInput} onChange={e => setClassInput(e.target.value)} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View</button>
          </form>
          {classStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{classStatus}</div>}
          {classStudents.length > 0 && (
            <div style={{ fontWeight: 600, color: '#1e3c72', marginBottom: 10 }}>Total number of students = {classStudents.length}</div>
          )}
          {classStudents.length > 0 ? (
            <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
              {classStudents.map((student, idx) => (
                <div key={student._id || idx} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <img
                      src={student.photo || '/default-avatar.png'}
                      alt="Profile"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                    />
                  </div>
                  {student.name && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                      <span style={{ color: "#222", fontWeight: 500 }}>{student.name}</span>
                    </div>
                  )}
                  {Object.entries(student).map(([key, value]) => {
                    if (key === "guardian" && Array.isArray(value) && value.length > 0) {
                      return (
                        <div key={key} style={{ marginTop: 8 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Guardians:</span>
                          <table style={{ width: '100%', marginTop: 4, background: '#f7fafd', borderRadius: 8 }}>
                            <thead>
                              <tr>
                                <th style={{ padding: 4, textAlign: 'left' }}>Name</th>
                                <th style={{ padding: 4, textAlign: 'left' }}>Email</th>
                                <th style={{ padding: 4, textAlign: 'left' }}>Role</th>
                              </tr>
                            </thead>
                            <tbody>
                              {value.map((g, idx) => (
                                <tr key={idx}>
                                  <td style={{ padding: 4 }}>{g.name || "-"}</td>
                                  <td style={{ padding: 4 }}>{g.email}</td>
                                  <td style={{ padding: 4 }}>{g.role}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds" && key !== "name" && key !== "profileVisibility") {
                      return (
                        <div key={key} style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                          <span style={{ color: "#222" }}>{String(value) || "-"}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          ) : !classStatus && <div>No students found for this class.</div>}
        </div>
      )}
    </div>
  );
} 