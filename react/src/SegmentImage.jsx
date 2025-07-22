import React, { useState } from 'react';
import axios from 'axios';

function SegmentImageUploader() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1]; // Strip data URL prefix
      setFile(base64String);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const res = await axios.post(
        'https://app.beam.cloud/endpoint/inference',
        { image_base64: file },
        {
          headers: {
            'Authorization': 'Bearer 9rK-Vb5cTqdCQvvvPLvvSIUJDMVztE40-VPp5rihcAoKJI3HRua-0DKFxSpAoyK1eeHMgXFUhVh3Fec0FqCWhg==',
            'Content-Type': 'application/json',
          },
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({ success: false, error: err.message });
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Segment</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

export default SegmentImageUploader;
