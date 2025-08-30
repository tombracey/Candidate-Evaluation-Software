import React, { useState } from "react";

function App() {
  // State variables:
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  // Selects the backend Python function
  const handleFunctionSelect = (func) => {
    console.log("Selected Function:", func); // for debgging
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
    console.log(`Input Changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let args = {};
    let url = "";

    if (selectedFunction === "evaluate_table") {
      const file = selectedFiles[0]?.path;
      if (!file) {
        setError("Please select a file for Spreadsheet.");
        return;
      }
      args = { path: file, ...formData };
      url = "http://127.0.0.1:8000/evaluate_table/";
    } else if (selectedFunction === "evaluate_all_CVs") {
      const files = Array.from(selectedFiles).map((file) => file.path);
      if (files.length === 0) {
        setError("Please select at least one file for CVs.");
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
    <div style={{ backgroundColor: "#2C3E50", color: "white", minHeight: "100vh", padding: "20px" }}>
      <h1>What would you like to evaluate?</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
        <div
          onClick={() => handleFunctionSelect("evaluate_all_CVs")}
          style={{
            backgroundColor: selectedFunction === "evaluate_all_CVs" ? "#3a5f66" : "#6a9ba8",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
            width: "300px",
            height: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/data/images/CVs.png"
            alt="CVs"
            style={{ width: "150px", height: "150px", marginBottom: "10px" }}
          />
          <h3>CVs</h3>
          <p style={{ fontSize: "14px", textAlign: "center" }}>
            Upload CVs to finds the best candidates for a role.
          </p>
        </div>
        <div
          onClick={() => handleFunctionSelect("evaluate_table")}
          style={{
            backgroundColor: selectedFunction === "evaluate_table" ? "#3a5f66" : "#6a9ba8",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
            width: "300px",
            height: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/data/images/Spreadsheet.png"
            alt="Spreadsheet"
            style={{ width: "150px", height: "100px", marginBottom: "10px" }}
          />
          <h3>Spreadsheet</h3>
          <p style={{ fontSize: "14px", textAlign: "center" }}>
            Upload a spreadsheet to evaluate and rank candidates.<br/><br/> - Find travel times to an employer<br/> - Add custom metrics to rank candidates
          </p>
        </div>
      </div>
      {selectedFunction && (
        <form onSubmit={handleSubmit}>
          <label>
            Select {selectedFunction === "evaluate_table" ? "a file" : "files"}:
            <input
              type="file"
              multiple={selectedFunction === "evaluate_all_CVs"}
              onChange={handleFileChange}
              style={{ display: "block", margin: "10px 0" }}
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
          <button type="submit" style={{ backgroundColor: "#6a9ba8", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Run
          </button>
        </form>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Results</h2>
      <table border="1" style={{ width: "100%", marginTop: "20px", color: "white" }}>
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