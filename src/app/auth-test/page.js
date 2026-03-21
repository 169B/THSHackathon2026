"use client";

import { useState } from "react";
import { signup, login, logout, getCurrentUser, getUserProfile, updateUserProfile } from "@/lib/appwrite";

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  async function handleSignup(e) {
    e.preventDefault();
    try {
      const result = await signup(email, password, name);
      setUser(result);
      const p = await getUserProfile();
      setProfile(p);
      setMessage(`Signed up as ${result.name} — profile saved to database!`);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      await login(email, password);
      const me = await getCurrentUser();
      setUser(me);
      const p = await getUserProfile();
      setProfile(p);
      setMessage(`Logged in as ${me.name}`);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
      setProfile(null);
      setMessage("Logged out");
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  }

  async function handleGetProfile() {
    try {
      const me = await getCurrentUser();
      setUser(me);
      const p = await getUserProfile();
      setProfile(p);
      setMessage(`Profile loaded for ${me.name}`);
    } catch (err) {
      setMessage("Not logged in");
      setUser(null);
      setProfile(null);
    }
  }

  async function handleUpdateBio(e) {
    e.preventDefault();
    try {
      const updated = await updateUserProfile({ bio });
      setProfile(updated);
      setMessage("Bio updated!");
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Auth + Profile Test</h1>

      <form style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
        />

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button onClick={handleSignup} style={{ padding: "0.5rem 1rem", background: "#FD366E", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Sign Up
          </button>
          <button onClick={handleLogin} style={{ padding: "0.5rem 1rem", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Log In
          </button>
        </div>
      </form>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button onClick={handleGetProfile} style={{ padding: "0.5rem 1rem", background: "#555", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Get Profile
        </button>
        <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", background: "#999", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Log Out
        </button>
      </div>

      {user && (
        <form onSubmit={handleUpdateBio} style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <input
            type="text"
            placeholder="Update your bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px", flex: 1 }}
          />
          <button type="submit" style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Save
          </button>
        </form>
      )}

      {message && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#f0f0f0", borderRadius: "4px", wordBreak: "break-all" }}>
          {message}
        </div>
      )}

      {profile && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Profile (from Database)</h3>
          <pre style={{ padding: "1rem", background: "#1a1a2e", color: "#0f0", borderRadius: "4px", fontSize: "0.8rem", overflow: "auto" }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
