import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PaidMedia from "./pages/PaidMedia";
import SEO from "./pages/SEO";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/paid" element={<PaidMedia />} />
      <Route path="/seo" element={<SEO />} />
    </Routes>
  );
}
