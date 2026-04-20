import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../services/profileService";

function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [form, setForm] = useState({
    profile_name: "",
    profile_type: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(", ");
    return "Something went wrong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createProfile(userId, form);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold">Create Profile</h1>
        <p className="mt-2 text-sm text-slate-400">
          Add a profile to organize your expenses.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
            type="text"
            name="profile_name"
            placeholder="Profile Name"
            value={form.profile_name}
            onChange={handleChange}
          />

          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
            type="text"
            name="profile_type"
            placeholder="Profile Type"
            value={form.profile_type}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Save Profile
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;