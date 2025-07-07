import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BASE_API_URL } from "../../utils/apiurl";
import { setToken, setUserData, getToken, isAuthenticated, isTokenExpired } from "../../utils/auth";
import useOtpTimer from "./useOtpTimer";

export default function useLogin() {
  const [mode, setMode] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showNotFoundPopup, setShowNotFoundPopup] = useState(false);
  const [isAdminOtp, setIsAdminOtp] = useState(false);
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpBlocks, setOtpBlocks] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const router = useRouter();

  // OTP timer logic
  const { timeLeft: otpTimer, expired: otpExpired, start: startOtpTimer, reset: resetOtpTimer } = useOtpTimer(120);

  // When OTP is sent, start timer
  useEffect(() => {
    if (otpSent) startOtpTimer();
  }, [otpSent, startOtpTimer]);

  // Focus first OTP input when OTP is sent
  useEffect(() => {
    if (otpSent && otpRefs[0].current) {
      setTimeout(() => {
        otpRefs[0].current.focus();
      }, 100);
    }
  }, [otpSent]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = getToken();
    if (isAuthenticated() && !isTokenExpired(token)) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role && payload.role.toLowerCase();
        if (role === 'admin') router.replace('/admin/dashboard');
        else if (role === 'student') router.replace('/student/dashboard');
        else if (role === 'teacher') router.replace('/teacher/dashboard');
        else if (role === 'parent') router.replace('/parent/dashboard');
        else router.replace('/login');
      } catch {}
    }
  }, [router]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    // Try admin first
    try {
      const adminRes = await fetch(`${BASE_API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      if (adminRes.ok) {
        const data = await adminRes.json();
        setToken(data.token);
        setUserData(data.admin);
        localStorage.setItem("userEmail", cleanEmail);
        localStorage.setItem("isSuperAdmin", data.admin.isSuperAdmin ? "true" : "false");
        setMsg("Admin login successful!");
        setError("");
        router.push("/admin/dashboard");
        return;
      }
      if (adminRes.status === 401) {
        setError("Incorrect password.");
        return;
      }
    } catch (err) {}
    // Try student
    try {
      const studentRes = await fetch(`${BASE_API_URL}/login-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      if (studentRes.ok) {
        const data = await studentRes.json();
        setToken(data.token);
        setUserData(data.user);
        localStorage.setItem("userEmail", cleanEmail);
        setMsg("Student login successful!");
        setError("");
        router.push("/student/dashboard");
        return;
      }
      if (studentRes.status === 401) {
        setError("Incorrect password.");
        return;
      }
    } catch (err) {}
    // Try teacher
    try {
      const teacherRes = await fetch(`${BASE_API_URL}/login-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      if (teacherRes.ok) {
        const data = await teacherRes.json();
        setToken(data.token);
        setUserData(data.user);
        localStorage.setItem("userEmail", cleanEmail);
        setMsg("Teacher login successful!");
        setError("");
        router.push("/teacher/dashboard");
        return;
      }
      if (teacherRes.status === 401) {
        setError("Incorrect password.");
        return;
      }
    } catch (err) {}
    // Try guardian/parent
    try {
      const guardianRes = await fetch(`${BASE_API_URL}/login-guardian`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      if (guardianRes.ok) {
        const data = await guardianRes.json();
        setToken(data.token);
        setUserData(data.user);
        localStorage.setItem("userEmail", cleanEmail);
        setMsg("Parent login successful!");
        setError("");
        router.push("/guardian/dashboard");
        return;
      }
      if (guardianRes.status === 401) {
        setError("Incorrect password.");
        return;
      }
    } catch (err) {}
    setError("User not found.");
  };

  const handleSendOtp = async () => {
    setError("");
    setMsg("");
    setIsAdminOtp(false);
    setOtpSent(false);
    setAdminOtpSent(false);
    setSendingOtp(true);
    setOtpBlocks(["", "", "", "", "", ""]);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const adminRes = await fetch(`${BASE_API_URL}/getadmins`);
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        const foundAdmin = (adminData.admins || []).find(a => a.email === cleanEmail);
        if (foundAdmin) {
          const sendOtpRes = await fetch(`${BASE_API_URL}/user/send-login-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail })
          });
          setSendingOtp(false);
          if (sendOtpRes.ok) {
            setIsAdminOtp(true);
            setOtpSent(true);
            setAdminOtpSent(true);
            setMsg("OTP sent to your email.");
          } else {
            const data = await sendOtpRes.json();
            setError(data.message || "Failed to send OTP.");
          }
          return;
        }
      }
    } catch (err) {}
    try {
      const userRes = await fetch(`${BASE_API_URL}/user/find-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail })
      });
      if (userRes.ok) {
        const sendOtpRes = await fetch(`${BASE_API_URL}/user/send-login-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail })
        });
        setSendingOtp(false);
        if (sendOtpRes.ok) {
          setOtpSent(true);
          setMsg("OTP sent to your email.");
        } else {
          const data = await sendOtpRes.json();
          setError(data.message || "Failed to send OTP.");
        }
      } else if (userRes.status === 404) {
        setSendingOtp(false);
        setError("");
        setShowNotFoundPopup(true);
      } else {
        setSendingOtp(false);
        const data = await userRes.json();
        setError(data.message || "Failed to check user.");
      }
    } catch (err) {
      setSendingOtp(false);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpBlockChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newBlocks = [...otpBlocks];
    newBlocks[idx] = val;
    setOtpBlocks(newBlocks);
    if (val && idx < 5) otpRefs[idx + 1].current.focus();
  };

  const handleOtpBlockKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpBlocks[idx] && idx > 0) {
      otpRefs[idx - 1].current.focus();
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    const cleanEmail = email.trim().toLowerCase();
    if (!otpSent) {
      setError("Please click on Send OTP first.");
      return;
    }
    if (isAdminOtp && adminOtpSent) {
      try {
        const res = await fetch(`${BASE_API_URL}/user/verify-login-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, otp: otpBlocks.join("") })
        });
        if (res.ok) {
          const superRes = await fetch(`${BASE_API_URL}/check-superadmin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail })
          });
          let isSuperAdmin = false;
          if (superRes.ok) {
            const superData = await superRes.json();
            isSuperAdmin = !!superData.isSuperAdmin;
          }
          localStorage.setItem("userEmail", cleanEmail);
          localStorage.setItem("isSuperAdmin", isSuperAdmin ? "true" : "false");
          setMsg("Admin login successful!");
          setError("");
          router.replace("/admin/dashboard");
        } else {
          const data = await res.json();
          setError(data.message || "Invalid OTP.");
        }
      } catch (err) {
        setError("Admin OTP login failed.");
      }
      return;
    }
    try {
      const res = await fetch(`${BASE_API_URL}/user/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp: otpBlocks.join("") })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg("OTP login successful!");
        setError("");
        setToken(data.token);
        setUserData(data.user);
        localStorage.setItem("userEmail", cleanEmail);
        if (data.user && data.user.registeredAs) {
          const role = data.user.registeredAs.toLowerCase();
          if (role === "student") router.replace("/student/dashboard");
          else if (role === "teacher") router.replace("/teacher/dashboard");
          else if (role === "parent") router.replace("/parent/dashboard");
          else router.replace("/login");
        } else {
          router.replace("/login");
        }
      } else {
        const data = await res.json();
        setError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("OTP login failed. Please try again.");
    }
  };

  return {
    // State
    mode, setMode,
    email, setEmail,
    password, setPassword,
    otp, setOtp,
    otpSent, setOtpSent,
    error, setError,
    msg, setMsg,
    showRegister, setShowRegister,
    showNotFoundPopup, setShowNotFoundPopup,
    isAdminOtp, setIsAdminOtp,
    adminOtpSent, setAdminOtpSent,
    sendingOtp, setSendingOtp,
    showPassword, setShowPassword,
    otpBlocks, setOtpBlocks,
    otpRefs,
    otpTimer, otpExpired,
    // Handlers
    handlePasswordLogin,
    handleSendOtp,
    handleOtpBlockChange,
    handleOtpBlockKeyDown,
    handleOtpLogin,
    router
  };
} 