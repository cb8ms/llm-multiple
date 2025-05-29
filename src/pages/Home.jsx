import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6">Choose a Tool</h1>
      <button onClick={() => navigate("/seo")} className="bg-purple-600 text-white px-6 py-3 rounded mr-4">
        SEO
      </button>
      <button onClick={() => navigate("/paid")} className="bg-blue-600 text-white px-6 py-3 rounded">
        Paid Media
      </button>
      <button onClick={() => navigate("/organicSocial")} className="bg-green-600 text-white px-6 py-3 rounded ml-4">
        Organic Social
      </button>
    </div>
  );
}
