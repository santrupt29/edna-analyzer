import React, { useState } from "react";
import axiosInstance from "../lib/axios";
import {supabase} from "../lib/supabase.js";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("fasta");
  const [status, setStatus] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus("Please select a file.");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("You must be signed in to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user.id); 
      formData.append("file_type", fileType);

      const { data } = await axiosInstance.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus(`✅ File uploaded successfully: ${data.upload.file_name}`);
    } catch (error) {
      if (error.response) {
        setStatus(`❌ Error: ${error.response.data.error}`);
      } else {
        setStatus(`❌ Upload failed: ${error.message}`);
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload eDNA File</h2>
      <form onSubmit={handleUpload}>
        <div>
          <label>Choose File: </label>
          <input
            type="file"
            accept=".fasta,.fastq,.csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div>
          <label>File Type: </label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          >
            <option value="fasta">FASTA</option>
            <option value="fastq">FASTQ</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          Upload
        </button>
      </form>

      {status && <p style={{ marginTop: "15px" }}>{status}</p>}
    </div>
  );
};

export default UploadPage;
