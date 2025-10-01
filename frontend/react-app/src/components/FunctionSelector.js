import React from "react";

const FunctionSelector = ({ selectedFunction, handleFunctionSelect }) => {
  return (
    <div className="function-selector">
      <div
        onClick={() => handleFunctionSelect("evaluate_all_CVs")}
        className={`flexbox ${selectedFunction === "evaluate_all_CVs" ? "selected" : ""}`}
      >
        <img src="/data/images/CVs.png" alt="CVs" className="flexbox-image" />
        <h3>CVs</h3>
        <p>Upload CVs to evaluate their suitability for a specific role.</p>
      </div>
      <div
        onClick={() => handleFunctionSelect("evaluate_table")}
        className={`flexbox ${selectedFunction === "evaluate_table" ? "selected" : ""}`}
      >
        <img
          src="/data/images/Spreadsheet.png"
          alt="Spreadsheet"
          className="flexbox-image"
          style={{ height: "100px", marginTop: "40px", marginBottom: "25px" }}
        />
        <h3>Spreadsheet</h3>
        <p>
          Upload a spreadsheet to:<br />- Find candidates' travel times to an employer<br />- Add custom metrics to rank candidates
        </p>
      </div>
    </div>
  );
};

export default FunctionSelector;