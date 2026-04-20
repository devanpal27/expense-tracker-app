import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfiles } from "../services/profileService";
import toast from "react-hot-toast";
import {
  getExpenses,
  updateExpenseReceivedAmount,
  deleteExpense,
} from "../services/expenseService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [profiles, setProfiles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("all");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("all");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [receivedAmountInput, setReceivedAmountInput] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    loadProfiles();
    loadExpenses();
  }, [userId, navigate]);

  const loadProfiles = async () => {
    try {
      const data = await getProfiles(userId);
      setProfiles(data);
    } catch (err) {
      console.log("Error loading profiles");
      toast.error("Failed to load profiles");
    }
  };

  const loadExpenses = async () => {
    try {
      const data = await getExpenses(userId);
      setExpenses(data);
    } catch (err) {
      console.log("Error loading expenses");
      toast.error("Failed to load expenses");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmDelete) return;

    try {
      await deleteExpense(id);
      await loadExpenses();
      toast.success("Expense deleted");
    } catch (err) {
      console.log("Error deleting expense");
      toast.error("Error deleting expense");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const profileMatch =
        selectedProfile === "all" ||
        Number(expense.profile_id) === Number(selectedProfile);

      const paymentMatch =
        selectedPaymentMode === "all" ||
        expense.payment_mode === selectedPaymentMode;

      return profileMatch && paymentMatch;
    });
  }, [expenses, selectedProfile, selectedPaymentMode]);

  const selectedProfileData = useMemo(() => {
    if (selectedProfile === "all") return null;
    return profiles.find((p) => Number(p.id) === Number(selectedProfile)) || null;
  }, [profiles, selectedProfile]);

  const selectedProfileExpenses = useMemo(() => {
    if (!selectedProfileData) return [];
    return filteredExpenses.filter(
      (expense) => Number(expense.profile_id) === Number(selectedProfileData.id)
    );
  }, [filteredExpenses, selectedProfileData]);

  const profileSpent = selectedProfileExpenses.reduce(
    (sum, expense) => sum + Number(expense.actual_amount || 0),
    0
  );

  const profileReceived = selectedProfileExpenses.reduce(
    (sum, expense) => sum + Number(expense.received_amount || 0),
    0
  );

  const profileBalance = profileReceived - profileSpent;

  const totalSpent = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.actual_amount || 0),
    0
  );

  const totalReceived = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.received_amount || 0),
    0
  );

  const totalBalance = totalReceived - totalSpent;

  const paymentModes = [...new Set(expenses.map((e) => e.payment_mode).filter(Boolean))];

  const chartData = useMemo(() => {
    return profiles.map((profile) => {
      const profileExpenses = expenses.filter(
        (expense) => Number(expense.profile_id) === Number(profile.id)
      );

      return {
        name: profile.profile_name,
        spent: profileExpenses.reduce(
          (sum, expense) => sum + Number(expense.actual_amount || 0),
          0
        ),
        received: profileExpenses.reduce(
          (sum, expense) => sum + Number(expense.received_amount || 0),
          0
        ),
      };
    });
  }, [profiles, expenses]);

  const startEditing = (expense) => {
    setEditingExpenseId(expense.id);
    setReceivedAmountInput(expense.received_amount ?? 0);
  };

  const cancelEditing = () => {
    setEditingExpenseId(null);
    setReceivedAmountInput("");
  };

  const saveReceivedAmount = async (expenseId) => {
    try {
      const amount =
        receivedAmountInput === "" ? 0 : Number(receivedAmountInput);

      await updateExpenseReceivedAmount(expenseId, amount);
      setEditingExpenseId(null);
      setReceivedAmountInput("");
      await loadExpenses();
      toast.success("Updated successfully");
    } catch (err) {
      console.log("Failed to update received amount");
      toast.error("Failed to update received amount");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expense Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">
              Track profile-wise expenses, received amounts, and financial balance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
            >
              Create Profile
            </button>

            <button
              onClick={() => navigate("/add-expense")}
              className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:opacity-90"
            >
              Add Expense
            </button>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-red-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-sm text-slate-400">Total Spent</p>
            <p className="mt-2 text-2xl font-bold text-white">₹{totalSpent.toFixed(2)}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-sm text-slate-400">Total Received</p>
            <p className="mt-2 text-2xl font-bold text-sky-400">
              ₹{totalReceived.toFixed(2)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-sm text-slate-400">Net Balance</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                totalBalance >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              ₹{totalBalance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            <option value="all">All Profiles</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.profile_name}
              </option>
            ))}
          </select>

          <select
            value={selectedPaymentMode}
            onChange={(e) => setSelectedPaymentMode(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            <option value="all">All Payment Modes</option>
            {paymentModes.map((mode, index) => (
              <option key={index} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        {selectedProfileData && (
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{selectedProfileData.profile_name}</h2>
                <p className="text-sm text-slate-400">
                  Type: {selectedProfileData.profile_type}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-900/70 px-4 py-3">
                  <p className="text-sm text-slate-400">Spent</p>
                  <p className="text-lg font-semibold">₹{profileSpent.toFixed(2)}</p>
                </div>

                <div className="rounded-2xl bg-slate-900/70 px-4 py-3">
                  <p className="text-sm text-slate-400">Received</p>
                  <p className="text-lg font-semibold">₹{profileReceived.toFixed(2)}</p>
                </div>

                <div className="rounded-2xl bg-slate-900/70 px-4 py-3">
                  <p className="text-sm text-slate-400">Balance</p>
                  <p
                    className={`text-lg font-semibold ${
                      profileBalance >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    ₹{profileBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="mb-4 text-2xl font-semibold">Expense Analysis</h2>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="spent" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="received" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Expenses</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
              {filteredExpenses.length} items
            </span>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <p className="text-lg font-medium">No expenses yet</p>
              <p className="mt-1 text-sm">Start by adding your first expense</p>
              <button
                onClick={() => navigate("/add-expense")}
                className="mt-4 rounded-xl bg-sky-500 px-4 py-2 text-white hover:bg-sky-600"
              >
                Add Expense
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:scale-[1.01] hover:border-sky-400/30 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold">{expense.title}</h4>
                      <p className="mt-1 text-sm text-slate-400">
                        {expense.category} • {expense.payment_mode}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Date: {new Date(expense.expense_date).toLocaleDateString()}
                      </p>

                      {expense.notes && (
                        <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                          Notes: {expense.notes}
                        </p>
                      )}
                    </div>

                    <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-sm text-slate-400">Actual Amount</p>
                      <p className="text-xl font-bold text-red-400">
                        ₹{Number(expense.actual_amount).toFixed(2)}
                      </p>

                      <div className="mt-4">
                        <p className="mb-2 text-sm text-slate-400">Received Amount</p>

                        {editingExpenseId === expense.id ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              step="0.01"
                              value={receivedAmountInput}
                              onChange={(e) => setReceivedAmountInput(e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              className="no-spinner w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-sky-500"
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={() => saveReceivedAmount(expense.id)}
                                className="flex-1 rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-green-400">
                              ₹{Number(expense.received_amount || 0).toFixed(2)}
                            </p>

                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditing(expense)}
                                className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="flex-1 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;