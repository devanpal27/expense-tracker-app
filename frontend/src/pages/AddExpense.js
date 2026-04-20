import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExpenses } from "../services/expenseService";
import { getProfiles } from "../services/profileService";
import toast from "react-hot-toast";

function AddExpense() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const today = new Date().toISOString().split("T")[0];

  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState({
    profile_id: "",
    title: "",
    category: "",
    payment_mode: "",
    actual_amount: "",
    received_amount: "",
    expense_date: today,
    notes: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    loadProfiles();
  }, [userId, navigate]);

  const loadProfiles = async () => {
    try {
      const data = await getProfiles(userId);
      setProfiles(data);
    } catch (err) {
      setError("Failed to load profiles");
      toast.error("Failed to load profiles");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.profile_id || !form.title || !form.actual_amount) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      await createExpenses(userId, {
        profile_id: Number(form.profile_id),
        title: form.title,
        category: form.category,
        payment_mode: form.payment_mode,
        actual_amount: Number(form.actual_amount),
        received_amount:
          form.received_amount === "" ? 0 : Number(form.received_amount),
        expense_date: form.expense_date,
        notes: form.notes || null,
      });

      toast.success("Expense added successfully");
      navigate("/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((i) => i.msg).join(", ")
          : "Something went wrong";

      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold">Add Expense</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create and assign an expense to a profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Profile */}
          <select
            name="profile_id"
            value={form.profile_id}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
          >
            <option value="">Select Profile</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.profile_name} ({profile.profile_type})
              </option>
            ))}
          </select>

          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-sky-400"
          />

          {/* Category Dropdown */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
          </select>

          {/* Payment Mode Dropdown */}
          <select
            name="payment_mode"
            value={form.payment_mode}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
          >
            <option value="">Select Payment Mode</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>

          {/* Actual Amount */}
          <input
            type="number"
            step="0.01"
            name="actual_amount"
            placeholder="Actual Amount"
            value={form.actual_amount}
            onChange={handleChange}
            onWheel={(e) => e.target.blur()}
            className="no-spinner w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
          />

          {/* Received Amount */}
          <input
            type="number"
            step="0.01"
            name="received_amount"
            placeholder="Received Amount"
            value={form.received_amount}
            onChange={handleChange}
            onWheel={(e) => e.target.blur()}
            className="no-spinner w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400"
          />

          {/* Date */}
          <input
            type="date"
            name="expense_date"
            value={form.expense_date}
            onChange={handleChange}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
          />

          {/* Notes */}
          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-sky-400"
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 font-semibold text-white transition hover:scale-[1.02] hover:opacity-90"
          >
            Save Expense
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

export default AddExpense;