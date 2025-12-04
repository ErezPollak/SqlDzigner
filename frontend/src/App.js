import React, { useState } from "react";
import axios from "axios";

function App() {
  const [activeTab, setActiveTab] = useState("login"); // register/login/profile

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null); // logged-in user

  // Handle input change
  const handleChange = (e, formType) => {
    const name = e.target.name;
    const value = e.target.value;
    if (formType === "register") {
      setRegisterForm({ ...registerForm, [name]: value });
      setErrors({ ...errors, [name]: "" });
    } else if (formType === "login") {
      setLoginForm({ ...loginForm, [name]: value });
      setErrors({ ...errors, [name]: "" });
    } else if (formType === "update") {
      setUpdateForm({ ...updateForm, [name]: value });
      setErrors({ ...errors, [name]: "" });
    }
    setSuccess("");
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const trimmedForm = {
      username: registerForm.username.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password.trim(),
    };

    const validationErrors = {};
    if (!trimmedForm.username) validationErrors.username = "Username is required.";
    if (!trimmedForm.email) validationErrors.email = "Email is required.";
    if (!trimmedForm.password) validationErrors.password = "Password is required.";
    if (trimmedForm.password.length > 72)
      validationErrors.password = "Password cannot exceed 72 characters.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/register",
        trimmedForm,
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccess("User registered successfully!");
      setRegisterForm({ username: "", email: "", password: "" });
    } catch (err) {
      if (err.response) {
        setErrors({general: err.response.data.detail});
      } else {
        setErrors({ general: "Server error, please try again later." });
      }
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const trimmedForm = {
      username: loginForm.username.trim(),
      password: loginForm.password.trim(),
    };

    if (!trimmedForm.username || !trimmedForm.password) {
      setErrors({ general: "UserName and password are required." });
      return;
    }

    try {
      console.log(trimmedForm)
      const res = await axios.post(
        "http://localhost:8000/login",
        trimmedForm,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(res.data.user)
      setUser(res.data.user.id); // store logged-in user info
      setUpdateForm({
        name: res.data.user.full_name || "",
        email: res.data.user.email || "",
        phone: res.data.user.phone || "",
      });
      setActiveTab("profile"); // go to profile screen
      setSuccess("Login successful!");
      setLoginForm({ email: "", password: "" });
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const backendErrors = err.response.data.detail;
        const fieldErrors = {};
        backendErrors.forEach((e) => {
          const field = e.loc[1];
          fieldErrors[field] = e.msg;
        });
        setErrors(fieldErrors);
      } else if (err.response && err.response.status === 401) {
        setErrors({ general: "Invalid credentials." });
      } else {
        setErrors({ general: "Server error, please try again later." });
      }
    }
  };

  // Update user details
  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const trimmedForm = {
      full_name: updateForm.name.trim(),
      email: updateForm.email.trim(),
      phone: updateForm.phone.trim(),
    };

    try {
      console.log(trimmedForm)
      const res = await axios.put(
        `http://localhost:8000/update-user/${user}`,
        trimmedForm,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(res)
      setUser(res.data.id);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.log(err)
      if (err.response) {
  
        setErrors({general: err.response.data.detail});
      } else {
        setErrors({ general: "Server error, please try again later." });
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "Arial" }}>
      <h2>
        {activeTab === "register"
          ? "Register"
          : activeTab === "login"
          ? "Login"
          : "Profile, Update Your information"}
      </h2>

      {/* Tabs */}
      {activeTab !== "profile" && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => { setActiveTab("register"); setErrors({}); setSuccess(""); }}
            style={{ marginRight: "10px", padding: "5px 10px" }}
          >
            Register
          </button>
          <button
            onClick={() => { setActiveTab("login"); setErrors({}); setSuccess(""); }}
            style={{ padding: "5px 10px" }}
          >
            Login
          </button>
        </div>
      )}

      {errors.general && <p style={{ color: "red" }}>{errors.general}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Register Form */}
      {activeTab === "register" && (
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "10px" }}>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={registerForm.username}
              onChange={(e) => handleChange(e, "register")}
              style={{ width: "100%", padding: "8px" }}
            />
            {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={registerForm.email}
              onChange={(e) => handleChange(e, "register")}
              style={{ width: "100%", padding: "8px" }}
            />
            {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={registerForm.password}
              onChange={(e) => handleChange(e, "register")}
              style={{ width: "100%", padding: "8px" }}
              maxLength={72}
            />
            {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
          </div>
          <button type="submit" style={{ padding: "10px 20px" }}>Register</button>
        </form>
      )}

      {/* Login Form */}
      {activeTab === "login" && (
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "10px" }}>
            <label>UserName:</label>
            <input
              type="username"
              name="username"
              value={loginForm.username}
              onChange={(e) => handleChange(e, "login")}
              style={{ width: "100%", padding: "8px" }}
            />
            {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={(e) => handleChange(e, "login")}
              style={{ width: "100%", padding: "8px" }}
              maxLength={72}
            />
            {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
          </div>
          <button type="submit" style={{ padding: "10px 20px" }}>Login</button>
        </form>
      )}

      {/* Profile Form */}
      {activeTab === "profile" && user && (
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: "10px" }}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={updateForm.name}
              onChange={(e) => handleChange(e, "update")}
              style={{ width: "100%", padding: "8px" }}
            />
            {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={updateForm.email}
              onChange={(e) => handleChange(e, "update")}
              style={{ width: "100%", padding: "8px" }}
            />
            {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={updateForm.phone}
              onChange={(e) => handleChange(e, "update")}
              style={{ width: "100%", padding: "8px" }}
            />
            {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}
          </div>
          <button type="submit" style={{ padding: "10px 20px" }}>
            Update Profile
          </button>
        </form>
      )}
    </div>
  );
}

export default App;
