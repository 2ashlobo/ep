import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup"; // 
import * as AuthContext from "./context/AuthContext";

function App() {
  return (
    <AuthContext.AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthContext.AuthProvider>
  );
}

export default App;
