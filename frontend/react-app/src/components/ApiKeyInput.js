import React from "react";

const ApiKeyInput = ({ googleApiKey, setGoogleApiKey }) => {
  const [showApiKey, setShowApiKey] = React.useState(false);

  const handleSaveKey = () => {
    if (!googleApiKey) {
      alert("Please enter your Google API key.");
    } else {
      localStorage.setItem("googleApiKey", googleApiKey);
      alert("API key saved");
    }
  };

  return (
    <div className="api-key-container">
      <label>
        Google API Key:
        <div style={{ position: "relative", display: "inline-block" }}>
          <input
            type={showApiKey ? "text" : "password"}
            value={googleApiKey}
            onChange={(e) => setGoogleApiKey(e.target.value)}
            placeholder="Enter your Google API key"
            style={{ paddingRight: "30px" }}
          />
          <span
            onClick={() => setShowApiKey((prev) => !prev)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "gray",
              fontSize: "14px",
            }}
          >
            {showApiKey ? "🙈" : "👁"}
          </span>
        </div>
      </label>
      <button className="button-styling" onClick={handleSaveKey}>
        Save Key
      </button>
    </div>
  );
};

export default ApiKeyInput;