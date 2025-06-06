import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SEO() {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("manual");
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [screenSize, setscreenSize] = useState("Desktop");
  const [pKeyword, setPkeyword] = useState("");
  const [sKeyword, setsKeyword] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [language, setLanguage] = useState("English UK");
  const [lines, setLines] = useState(5);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [bespokeTitleCharCount, setBespokeTitleCharCount] = useState("");
  const [bespokeDescCharCount, setBespokeDescCharCount] = useState("");
  const [recommendBrandInTitle, setRecommendBrandInTitle] = useState(false);
  const [objective, setObjective] = useState("Sales");

  function parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
        const [headerLine, ...rows] = lines;
        const headers = parseCsvLine(headerLine).map((h) => h.trim().toLowerCase());
        const expectedHeaders = ["url", "primary keyword", "secondary keyword", "brand"];
        const headerIndices = expectedHeaders.map((h) => headers.indexOf(h));

        if (headerIndices.includes(-1)) {
          alert("CSV is missing one or more required columns: URL, Primary Keyword, Secondary Keyword, Brand.");
          return;
        }

        const parsedRows = rows.map((row) => {
          const values = parseCsvLine(row);
          const rowData = {};
          expectedHeaders.forEach((header, i) => {
            rowData[header] = values[headerIndices[i]] || "";
          });
          return {
            url: rowData["url"],
            pKeyword: rowData["primary keyword"],
            sKeyword: rowData["secondary keyword"],
            brand: rowData["brand"],
          };
        });

        setCsvRows(parsedRows);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const generatePrompt = ({ url, pKeyword, sKeyword, brand }) => {
    let titleCharLimitLabel, descCharLimitLabel;
    let titleCharLimitMax, descCharLimitMax;
    let descCharRecommendedMin = 120;

    if (screenSize === "desktop") {
      titleCharLimitLabel = "55-65 characters or approximately 580px";
      descCharLimitLabel = "150-160 characters or approximately 920px";
      titleCharLimitMax = 65;
      descCharLimitMax = 160;
    } else if (screenSize === "mobile") {
      titleCharLimitLabel = "60-75 characters or approximately 580px";
      descCharLimitLabel = "120-130 characters or approximately 680px";
      titleCharLimitMax = 130; // Use desc limit for meta
      descCharLimitMax = 130;
    } else if (screenSize === "bespoke") {
      titleCharLimitMax = bespokeTitleCharCount || 65;
      descCharLimitMax = bespokeDescCharCount || 130;
      titleCharLimitLabel = `${titleCharLimitMax} `;
      descCharLimitLabel = `${descCharLimitMax} `;
    } else {
      titleCharLimitLabel = "55-65 characters or approximately 580px";
      descCharLimitLabel = "150-160 characters or approximately 920px";
      titleCharLimitMax = 65;
      descCharLimitMax = 160;
    }

    const basePrompt = `You are an SEO expert in writing metadata and must strictly follow the steps below to meet all input requirements. You will provide ${lines} distinct versions of each metadata output.

Inputs: URL: ${url}; Primary Keyword: ${pKeyword}; Secondary Keyword(s): ${sKeyword}; Brand: ${brand}. Use the tone of voice from the website at ${url}. Write for a ${screenSize.toLowerCase()} display audience in ${language}.

Input Key Marketing Objective:
The objective of the ads is to ${objective}

If it is Sales then focus will be on directly selling the product to the user. The content should emphasise product details, key benefits, and strong call-to-action (CTA) elements. The tone should be action-oriented, driving users towards making a purchase or conversion. This will include product-focused headlines, clear meta descriptions, and persuasive language encouraging immediate action.
If it is Editorial then goal is to generate awareness and interest in the product. Content should highlight the product's value within a broader context, providing informative, engaging, and insightful content that educates the user. The approach will be more story-driven and centred around building awareness. Use content-driven headlines and descriptions, focusing on showcasing features and benefits in a more subtle, less direct way.

Your task is to write:
- ${lines} page titles, each no more than ${titleCharLimitMax} characters (including spaces), and ideally within 5 characters of that limit.
${recommendBrandInTitle ? "- Please do add the Brand name at the end of the Page Titles.\n" : ""}
- ${lines} meta descriptions, each no more than ${descCharLimitMax} characters (including spaces), and each should use at least ${descCharRecommendedMin} characters. If possible, aim for ${descCharLimitMax} characters for maximum search snippet impact.

Rules:
1. Maximize character usage: Each output should be as close as possible to the allowed character limit without exceeding it. Do not be conservative with length.
2. Page titles: Do not include the brand name; use a hyphen (-) as a separator, not a pipe (|); place the primary keyword (${pKeyword}) early, and include secondary keyword(s) (${sKeyword}) naturally.
3. Meta descriptions: Must include the brand name (${brand}); encourage user engagement and click-through; begin with the most important information to preserve meaning if truncated.
4. Capitalization: All location names must be capitalized (e.g., "london" → "London"); ensure proper nouns like cities, countries, and regions use correct capitalization.

IMPORTANT: Output ONLY the following fields for each version, in this exact order, with no extra text, no explanations, and no markdown or special formatting. Use plain text only. DO NOT use asterisks, hashes, or any special characters.


For each version, output in this format:

For input: ${pKeyword} - Brand {${brand} - URL: ${url}
Title 1: [text] ([character count])
Meta Description 1: [text] ([character count])
Title 2: [text] ([character count])
Meta Description 2: [text] ([character count])
...repeat up to Title ${lines} and Meta Description ${lines}...

Do not include any other text, explanations, or formatting. Use only plain text as shown above.
`;
    return basePrompt;
  };

  const handleSubmit = async () => {
    setResult("");
    setLoading(true);

    try {
      if (inputType === "csv") {
        // Batch processing for CSV input
        const prompts = csvRows.map(generatePrompt);

        const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy-batch", { prompts }, { headers: { "Content-Type": "application/json" } });

        // Include CSV line number (assuming first data row is line 2)
        const allResults = response.data.responses.map((res, i) => `Line ${i + 2} (URL: ${csvRows[i].url}):\n${res.replace(/\*\*\*/g, "###").replace(/\*\*/g, "")}\n`);
        setResult(allResults.join("\n=========================\n\n"));
      } else {
        // Manual input (single request)
        const prompt = generatePrompt({ url, pKeyword, sKeyword, brand });
        const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy", { input_text: prompt }, { headers: { "Content-Type": "application/json" } });
        if (response.data.response) {
          setResult(`For input: ${url}\n${response.data.response.replace(/\*\*\*/g, "###").replace(/\*\*/g, "")}\n`);
        } else {
          setResult(`For input: ${url}\nNo output received.\n`);
        }
      }
    } catch (err) {
      setResult("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  // Export SEO XLSX (Download XLSX)
  const handleExportSEOXLSX = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://llm-backend-82gd.onrender.com/api/export-xlsx-seo", { llm_output: result }, { responseType: "blob", headers: { "Content-Type": "application/json" } });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "SEO_Metadata.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Export failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">SEO Marketing Copy Generator</h1>
        <div className="text-base mt-1">Instructions</div>
        <div className="text-sm">
          <ul className="mt-1 mb-4">
            <li>
              First select the type of input, if selecting CSV for Bulk upload, please download{" "}
              <a className="font-bold" href="https://docs.google.com/spreadsheets/d/1jt1pljedbNNdzBHes-lONTYTTdZvDSrHdhjWatfP6CE/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer">
                THIS TEMPLATE
              </a>
            </li>
            <li>To download the template: Click on File, Download and than select Comma-separated values (.csv)</li>
            <li>
              Please note that currently the maximum that can be uploaded at once is <strong>70 lines</strong> on the CSV file. If it is more then 70, please use multiple sheets.
            </li>
          </ul>
        </div>
        <div>
          <label className="font-semibold mr-4">Choose Input Type:</label>
          <select className="p-2 border" value={inputType} onChange={(e) => setInputType(e.target.value)}>
            <option value="manual">Manual Input</option>
            <option value="csv">Upload CSV</option>
          </select>
        </div>
        {inputType === "manual" ? (
          <>
            <input className="w-full p-2 border mb-2 mt-2" placeholder="Insert Client URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            <input className="w-full p-2 border mb-2" placeholder="Insert Primary keyword" value={pKeyword} onChange={(e) => setPkeyword(e.target.value)} />
            <input className="w-full p-2 border mb-2" placeholder="Insert Secondary keywords.(If more then one,use comma to separate them)" value={sKeyword} onChange={(e) => setsKeyword(e.target.value)} />
            <input className="w-full p-2 border mb-2" placeholder="Insert Client Brand name here" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </>
        ) : (
          <div className="border-dashed border-2 border-gray-400 p-6 mb-2 text-center mt-2">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="w-full text-center" />
            <p className="mt-2 text-gray-600">Upload a CSV file containing URLs or keywords.</p>
          </div>
        )}
        <div className="text-sm mt-1">Select the Language</div>
        <select className="w-full p-2 border mb-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option>English UK</option>
          <option>English US</option>
          <option>Italian</option>
          <option>French</option>
          <option>German</option>
        </select>
        <div className="text-sm mt-1">Select the Screen Size</div>
        <select
          className="w-full p-2 border mb-2"
          value={screenSize}
          onChange={(e) => {
            setscreenSize(e.target.value);
            if (e.target.value === "bespoke") {
              setBespokeTitleCharCount("");
              setBespokeDescCharCount("150-160");
            } else {
              setBespokeTitleCharCount("");
              setBespokeDescCharCount("");
            }
          }}
          required
        >
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
          <option value="bespoke">Bespoke</option>
        </select>

        {screenSize === "bespoke" && (
          <div className="mb-2">
            <div className="mt-2">
              <div className="text-sm mt-1">Title</div>
              <input type="number" min={1} max={120} value={bespokeTitleCharCount} onChange={(e) => setBespokeTitleCharCount(e.target.value)} className="w-full p-2 border mb-2" placeholder="Enter max title character count (max 75)" />
              {bespokeTitleCharCount > 75 && <div className="text-red-600 text-sm mt-1">Warning: Title character count cannot exceed 75.</div>}
              <div className="text-sm mt-1">Meta Description</div>
              <input type="text" value={bespokeDescCharCount} onChange={(e) => setBespokeDescCharCount(e.target.value)} className="w-full p-2 border" placeholder='Enter max description character count (e.g. "150-160")' />
            </div>
          </div>
        )}
        <div className="flex items-center mb-2">
          <input type="checkbox" id="recommendBrandInTitle" checked={recommendBrandInTitle} onChange={(e) => setRecommendBrandInTitle(e.target.checked)} className="mr-2" />
          <label htmlFor="recommendBrandInTitle" className="text-sm">
            Recommend adding the Brand name at the end of Page Titles
          </label>
        </div>
        <div className="text-sm mt-1">Type of Marketing Objective</div>
        <select className="w-full p-2 border mb-2" value={objective} onChange={(e) => setObjective(e.target.value)}>
          <option>Sales</option>
          <option>Editorial</option>
        </select>
        <div className="text-sm mt-1">Number of Lines</div>
        <select className="w-full p-2 border mb-2" value={lines} onChange={(e) => setLines(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>

        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit} disabled={loading}>
          Generate
        </button>
        <button className="ml-2 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => navigate("/")}>
          ← Back
        </button>

        {loading && (
          <div className="inline-flex items-center gap-2 text-blue-600 font-medium mt-2">
            <svg className="animate-spin h-4 w-4 text-blue-600 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Working on it…
          </div>
        )}
      </div>
      {result && (
        <div className="mt-2 w-full max-w-3xl mx-auto">
          <pre className="bg-gray-100 p-6 whitespace-pre-wrap w-full text-base">{result}</pre>
          <button className="ml-2 bg-green-600 text-white px-4 py-2 rounded" onClick={handleExportSEOXLSX}>
            Download XLSX
          </button>
        </div>
      )}
    </>
  );
}
