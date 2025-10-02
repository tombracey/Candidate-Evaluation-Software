import React, { useState, useEffect } from "react";
import "./App.css";
import ApiKeyInput from "./components/ApiKeyInput";
import FunctionSelector from "./components/FunctionSelector";
import ResultsTable from "./components/ResultsTable";

function App() {
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [newMetric, setNewMetric] = useState({ name: "", value: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("googleApiKey");
    if (savedKey) {
      setGoogleApiKey(savedKey);
    }
  }, []);

  const handleFunctionSelect = (func) => {
    setSelectedFunction(func);
    setSelectedFiles([]);
    setFormData({});
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    if (!googleApiKey) {
      setError("Google API key is required");
      setLoading(false);
      return;
    }
  
    let args = {};
    let url = "";
  
    const isTableFunction = selectedFunction === "evaluate_table";
    const filePaths = isTableFunction
      ? [selectedFiles[0]?.path]
      : Array.from(selectedFiles).map((file) => file.path);
  
    if (filePaths.length === 0 || !filePaths[0]) {
      setError(`Please upload ${isTableFunction ? "a spreadsheet" : "at least one file for CVs"}.`);
      setLoading(false);
      return;
    }
  
    // Transform metrics array into a dict:
    const metricsDict = metrics.reduce((acc, metric) => {
      acc[metric.name] = parseFloat(metric.value);
      return acc;
    }, {});
  
    args = isTableFunction
      ? { path: filePaths[0], ...formData, metrics: metricsDict, google_api_key: googleApiKey }
      : { pool: filePaths, ...formData, google_api_key: googleApiKey };
  
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
        setError(data.detail || "An unknown error occurred.");
      }
    } catch (err) {
      setError(`Failed to communicate with backend: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Candidate Evaluation</h1>
      <ApiKeyInput googleApiKey={googleApiKey} setGoogleApiKey={setGoogleApiKey} />
      <FunctionSelector selectedFunction={selectedFunction} handleFunctionSelect={handleFunctionSelect} />
      {selectedFunction && (
        <form onSubmit={handleSubmit} className="input-form">
          <div style={{ display: "flex", alignItems: "center" }}>
            <label className="button-styling">
              Select {selectedFunction === "evaluate_table" ? "a file" : "files"}
              <input
                type="file"
                multiple={selectedFunction === "evaluate_all_CVs"}
                onChange={handleFileChange}
                className="hidden-file-input"
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

          {/* Spreadsheet form */}
          {selectedFunction === "evaluate_table" && (
            <>
              <label>
                Account for travel time
                <input
                  type="checkbox"
                  name="find_travel_time"
                  checked={formData.find_travel_time || false}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "find_travel_time", value: e.target.checked },
                    })
                  }
                />
              </label>
              {formData.find_travel_time && (
                <>
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

          {/* CV form */}
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
                  name="location"
                  checked={formData.location || false}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "location", value: e.target.checked },
                    })
                  }
                />
              </label>
              <br />
              {formData.location && (
                <>
                  <label>
                    Employer address*
                    <input
                      type="text"
                      name="cv_employer_address"
                      value={formData.cv_employer_address || ""}
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
          {loading && (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          )}
        </form>
      )}
      {error && <p className="error-text">{error}</p>}
      {results.length > 0 && <ResultsTable results={results} />}
    </div>
  );
}

export default App;