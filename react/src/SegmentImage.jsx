import React, { useState } from "react";
import axios from 'axios'

const SegmentImage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const checkTaskStatus = async (taskId) => {
  try {
    const res = await fetch(`http://localhost:8050/task-status/${taskId}`);
    const data = await res.json();
    console.log("📥 Task status response:", data);

    if (data.status === "succeeded") {
      setResult(data.result);  // contains output like base64 image or masks
      setLoading(false);
    } else if (data.status === "failed") {
      setResult({ success: false, error: "Task failed on Beam." });
      setLoading(false);
    } else {
      // still pending
      setTimeout(() => checkTaskStatus(taskId), 2000);
    }
  } catch (err) {
    console.error("❌ Failed to check task status:", err);
    setResult({ success: false, error: err.message });
    setLoading(false);
  }
};

  const handleUpload = async () => {
  if (!file) return;

  console.log("📤 Uploading to backend with file:", file);

  const formData = new FormData();
  formData.append("file", file); // key should match FastAPI's expected "file"

  try {
    const res = await axios.post("http://localhost:8050/segments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Response from backend:", res.data);
    setResult(res.data); // show result on frontend
  } catch (err) {
    console.error("❌ Error uploading image:", err);
    setResult({ success: false, error: err.message });
  }
};


const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

  return (
    <div className="p-4 max-w-3xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">🖼️ SAM2 Image Segmenter</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {previewUrl && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Selected Image:</p>
          <img
            src={previewUrl}
            alt="Selected"
            className="w-80 mx-auto border rounded shadow"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? "Processing..." : "Segment Image"}
      </button>

      {result && (
        <div className="mt-6 text-left">
          <h2 className="text-lg font-semibold mb-2">📊 Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {result?.output_image && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">🖼️ Segmented Output:</h2>
            <img
              src={`data:image/png;base64,${result.output_image}`}
              alt="Segmented Result"
              className="w-80 mx-auto border rounded shadow"
            />
        </div>
    )}
    </div>
  );
};

export default SegmentImage;
