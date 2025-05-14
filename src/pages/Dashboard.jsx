import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

import "./Dashboard.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

const Dashboard = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "expenses"),
      where("user", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddOrUpdate = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || !category.trim()) {
      alert("Please enter a valid amount and category.");
      return;
    }

    if (editingId) {
      const ref = doc(db, "expenses", editingId);
      await updateDoc(ref, {
        amount: value,
        category: category.trim(),
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "expenses"), {
        amount: value,
        category: category.trim(),
        createdAt: serverTimestamp(),
        user: user.uid,
      });
    }

    setAmount("");
    setCategory("");
  };

  const handleEdit = (exp) => {
    setAmount(exp.amount);
    setCategory(exp.category);
    setEditingId(exp.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "expenses", id));
  };

  const validExpenses = expenses.filter(
    (exp) => typeof exp.amount === "number" && !isNaN(exp.amount) && exp.category
  );

  const income = validExpenses
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const expense = validExpenses
    .filter((e) => e.amount < 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const net = income + expense;

  const categoryMap = {};
  validExpenses.forEach((exp) => {
    const cat = exp.category || "Uncategorized";
    const key = exp.amount >= 0 ? `${cat} (Income)` : `${cat} (Expense)`;
    categoryMap[key] = (categoryMap[key] || 0) + Math.abs(exp.amount);
  });

  const chartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="dashboard-container">
      {/* Header with Expense Tracker and buttons */}
      <div className="dashboard-header">
        <h1>Expense Tracker</h1>
      </div>
      <div className="button-group">
        <button onClick={() => navigate("/")} className="btn btn-logout">Logout</button>
        <button onClick={() => setShowChart((prev) => !prev)} className="btn btn-chart">
          {showChart ? "Hide Chart" : "View Chart"}
        </button>
      </div>

      {showChart && (
        <div className="chart-container">
          <h3>Income & Expense by Category</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
              label={({ name, percent }) => percent > 0.05 ? `${name}` : ''}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </div>
      )}

      <div className="balance-card">
        <h2>Net Balance: ₹{isNaN(net) ? 0 : net.toLocaleString("en-IN")}</h2>
        <p className="income">Income: ₹{income.toLocaleString("en-IN")}</p>
        <p className="expense">Expense: ₹{Math.abs(expense).toLocaleString("en-IN")}</p>
      </div>

      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (positive = income, negative = expense)"
        className="input"
      />
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (e.g. Rent, Salary)"
        className="input"
      />
      <button onClick={handleAddOrUpdate} className="btn btn-add">
        {editingId ? "Update" : "Add Expense"}
      </button>

      <h3 className="recent-title">Recent Entries</h3>
      <ul className="expense-list">
        {validExpenses.map((exp) => (
          <li key={exp.id} className="expense-item">
            <span className="expense-category">{exp.category}</span>
            <span className={`expense-amount ${exp.amount >= 0 ? "text-green" : "text-red"}`}>
              ₹{exp.amount.toLocaleString("en-IN")}
            </span>
            <div className="expense-actions">
              <button className="btn-edit" onClick={() => handleEdit(exp)}>Edit</button>
              <button className="btn-delete" onClick={() => handleDelete(exp.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
