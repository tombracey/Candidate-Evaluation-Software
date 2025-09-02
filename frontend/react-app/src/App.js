import React, { useState } from "react";
import './App.css';

// Helper function to create CSV file from results
const generateCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => `"${value}"`)
      .join(",")
  );

  return [headers, ...rows].join("\n");
};


function App() {
  // State variables:
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [newMetric, setNewMetric] = useState({ name: "", value: "" });

  // Selects the backend Python function
  const handleFunctionSelect = (func) => {
    console.log("Selected Function:", func);
    setSelectedFunction(func);
    setSelectedFiles([]);
    setFormData({});
  };

  // Handles file uploads
  const handleFileChange = (e) => {
    console.log("Files Selected:", e.target.files);
    setSelectedFiles(e.target.files);
  };

  // Handles text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let args = {};
    let url = "";

    const isTableFunction = selectedFunction === "evaluate_table";
    const filePaths = isTableFunction
      ? [selectedFiles[0]?.path]
      : Array.from(selectedFiles).map((file) => file.path);

    if (filePaths.length === 0 || !filePaths[0]) {
      setError(`Please upload ${isTableFunction ? "a spreadsheet" : "at least one file for CVs"}.`);
      return;
    }

    args = isTableFunction
      ? { path: filePaths[0], ...formData }
      : { pool: filePaths, ...formData };

    url = `http://127.0.0.1:8000/${selectedFunction}/`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

      if (data.ok) {
        const parsedResults = typeof data.data === "string" ? JSON.parse(data.data) : data.data;
        setResults(Array.isArray(parsedResults) ? parsedResults : []);
      } else {
        setError(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      setError(`Failed to communicate with backend: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      <h1>Candidate Evaluation</h1>
      <div className="function-selector">
        <div
          onClick={() => handleFunctionSelect("evaluate_all_CVs")}
          className={`flexbox ${selectedFunction === "evaluate_all_CVs" ? "selected" : ""}`}
        >
          <img
            src="/data/images/CVs.png"
            alt="CVs"
            className="flexbox-image"
          />
          <h3>CVs</h3>
          <p>
            Upload CVs to evaluate their suitability for a specific role.
          </p>
        </div>
        <div
          onClick={() => handleFunctionSelect("evaluate_table")}
          className={`flexbox ${selectedFunction === "evaluate_table" ? "selected" : ""}`}
        >
          <img
            src="/data/images/Spreadsheet.png"
            alt="Spreadsheet"
            className="flexbox-image"
            style={{ height: '100px', marginTop: '40px', marginBottom: '25px' }}
          />
          <h3>Spreadsheet</h3>
          <p style={{marginTop: '-1px'}}>
            Upload a spreadsheet to:<br />- Find candidates' travel times to an employer<br />- Add custom metrics to rank candidates
          </p>
        </div>
      </div>
      {selectedFunction && (
        <form onSubmit={handleSubmit} className="input-form">
          <div style={{ display: "flex", alignItems: "center" }}>
            <label className="button-styling">
              Select {selectedFunction === "evaluate_table" ? "a file" : "files"}
              <input
                type="file"
                multiple={selectedFunction === "evaluate_all_CVs"}
                onChange={handleFileChange}
                className="hidden-file-input" // hides default file input to add styling
              />
            </label>
            {selectedFiles.length > 0 && (
              <span style={{ marginLeft: "10px" }}>
                {selectedFiles.length === 1
                  ? selectedFiles[0].name
                  : `${selectedFiles.length} files selected`}
              </span>
            )}
          </div>
    <br />
    {/* Spreadsheet form: */}
    {selectedFunction === "evaluate_table" && (
      <>
        <label>
          Account for travel time
          <input
            type="checkbox"
            name="find_travel_time"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                find_travel_time: e.target.checked,
              }))
            }
          />
        </label>
        {formData.find_travel_time && (
          <>
            {/* <label>
              Travel Weight:
              <input
                type="number"
                step="0.01"
                name="travel_weight"
                value={formData.travel_weight || ""}
                onChange={handleInputChange}
                placeholder="Default is 0.35"
              />
            </label>
            <br /> */}
            <label>
              Employer address*
              <input
                type="text"
                name="employer_address"
                value={formData.employer_address || ""}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Candidate address column name
              <input
                type="text"
                name="candidate_address_column"
                value={formData.candidate_address_column || ""}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}
        <div>
          <br />
          Add custom metrics
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="text"
              placeholder="Column name"
              value={newMetric.name}
              onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Weight - default is 1"
              value={newMetric.value}
              onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
            />
            <button
              type="button"
              className="small-button"
              onClick={() => {
                if (newMetric.name && newMetric.value) {
                  setMetrics((prev) => [...prev, newMetric]);
                  setNewMetric({ name: "", value: "" });
                }
              }}
            >
              Add metric
            </button>
          </div>
        </div>
        {metrics.length > 0 && (
          <div>
            <h5>Added metrics:</h5>
            <ul>
              {metrics.map((metric, index) => (
                <li key={index}>
                  {metric.name}: {metric.value}
                  <button
                    className="small-button"
                    type="button"
                    onClick={() =>
                      setMetrics((prev) => prev.filter((_, i) => i !== index))
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    )}
    {/* CV form: */}
    {selectedFunction === "evaluate_all_CVs" && (
      <>
        <label>
          Job Title*
          <input
            type="text"
            name="role"
            value={formData.role || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Job description<br />
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            placeholder="Optionally add more details about the role"
            rows="4"
            cols="50"
          />
        </label>
        <br />
        <label>
          Account for travel time
          <input
            type="checkbox"
            name="find_travel_time_cvs"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                find_travel_time_cvs: e.target.checked,
              }))
            }
          />
        </label>
        <br />
        {formData.find_travel_time_cvs && (
          <>
            <label>
              Employer address*
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
              />
            </label>
            <br />
          </>
        )}
      </>
    )}
    <br />
    <button type="submit" className="button-styling">
      Run
    </button>
  </form>
)}
      {error && <p className="error-text">{error}</p>}

      {/* Results: */}
      {results.length > 0 && (
      <>
        <h2>Results</h2>
        <table className="results-table">
          <thead>
            <tr>
              {Object.keys(results[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <button
          className="button-styling"
          onClick={() => {
            const csvContent = generateCSV(results);
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "results.csv");
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Download Results as CSV
        </button>
      </>
        )}
      </div>
    );
}
export default App;