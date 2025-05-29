import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import OrganicSocial from "./pages/OrganicSocial";
import PaidMedia from "./pages/PaidMedia";
import SEO from "./pages/SEO";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/paid" element={<PaidMedia />} />
      <Route path="/seo" element={<SEO />} />
      <Route path="/organicSocial" element={<OrganicSocial />} />
    </Routes>
  );
}
