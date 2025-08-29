import React, { useState } from "react";

function App() {
  // State variables:
  const [selectedFunction, setSelectedFunction] = useState("evaluate_table");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleFunctionChange = (e) => {
    setSelectedFunction(e.target.value);
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

    let args = {};
    let url = "";

    if (selectedFunction === "evaluate_table") {
      const file = selectedFiles[0]?.path;
      if (!file) {
        setError("Please select a file for Evaluate Table.");
        return;
      }
      args = { path: file, ...formData };
      url = "http://127.0.0.1:8000/evaluate_table/";
    } else if (selectedFunction === "evaluate_all_CVs") {
      const files = Array.from(selectedFiles).map((file) => file.path);
      if (files.length === 0) {
        setError("Please select at least one file for Evaluate All CVs.");
        return;
      }
      args = { pool: files, ...formData };
      url = "http://127.0.0.1:8000/evaluate_all_CVs/";
    }

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
    <div>
      <h1>Evaluation</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Select Function:
          <select value={selectedFunction} onChange={handleFunctionChange}>
            <option value="evaluate_table">Evaluate Table</option>
            <option value="evaluate_all_CVs">Evaluate All CVs</option>
          </select>
        </label>
        <br />
        <label>
          Select {selectedFunction === "evaluate_table" ? "a file" : "files"}:
          <input
            type="file"
            multiple={selectedFunction === "evaluate_all_CVs"}
            onChange={handleFileChange}
          />
        </label>
        <br />
        {selectedFunction === "evaluate_table" && (
          <>
            <label>
              Find Travel Time:
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
            <br />
            <label>
              Travel Weight:
              <input
                type="number"
                step="0.01"
                name="travel_weight"
                value={formData.travel_weight || ""}
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              Employer Address:
              <input
                type="text"
                name="employer_address"
                value={formData.employer_address || ""}
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              Candidate Address Column:
              <input
                type="text"
                name="candidate_address_column"
                value={formData.candidate_address_column || ""}
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              Metrics:
              <textarea
                name="metrics"
                value={formData.metrics || ""}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}
        {selectedFunction === "evaluate_all_CVs" && (
          <>
            <label>
              Role:
              <input
                type="text"
                name="role"
                value={formData.role || ""}
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              Location:
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}
        <br />
        <button type="submit">Run</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Results</h2>
      <table border="1">
        <thead>
          <tr>
            {Array.isArray(results) && results.length > 0 &&
              Object.keys(results[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(results) &&
            results.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;