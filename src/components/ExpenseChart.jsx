import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

const ExpenseChart = ({ expenses }) => {
  const categoryMap = {};

  expenses.forEach((expense) => {
    if (expense.type === "expense") {
      const category = expense.category || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + Math.abs(expense.amount);
    }
  });

  const data = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>Expense Breakdown by Category</h3>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default ExpenseChart;
