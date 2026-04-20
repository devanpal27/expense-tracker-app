import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"]

function Charts({ expenses }) {
  // Payment mode data
  const paymentData = Object.values(
    expenses.reduce((acc, curr) => {
      if (!acc[curr.payment_mode]) {
        acc[curr.payment_mode] = {
          name: curr.payment_mode,
          value: 0,
        };
      }
      acc[curr.payment_mode].value += curr.actual_amount;
      return acc;
    }, {})
  );
  
const monthlyData = Object.values(
    expenses.reduce((acc, curr) => {
      const month = new Date(curr.expense_date).toLocaleString("default", {
        month: "short",
      });

      if (!acc[month]) {
        acc[month] = { name: month, total: 0 };
      }

      acc[month].total += curr.actual_amount;
      return acc;
    }, {})
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      
      {/* Payment Mode Pie */}
      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px" }}>
        <h3>Payment Mode</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={paymentData} dataKey="value" nameKey="name">
              {paymentData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Bar */}
      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px" }}>
        <h3>Monthly Spending</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Charts;