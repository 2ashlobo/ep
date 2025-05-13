import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setExpenses(data);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <ul>
      {expenses.map(exp => (
        <li key={exp.id}>{exp.category} - ₹{exp.amount}</li>
      ))}
    </ul>
  );
};

export default ExpenseList;
