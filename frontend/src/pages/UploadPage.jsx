// import React, { useState } from "react";
// import axiosInstance from "../lib/axios";
// import {supabase} from "../lib/supabase.js";

// const UploadPage = () => {
//   const [file, setFile] = useState(null);
//   const [fileType, setFileType] = useState("fasta");
//   const [status, setStatus] = useState("");

//   const handleUpload = async (e) => {
//     e.preventDefault();

//     if (!file) {
//       setStatus("Please select a file.");
//       return;
//     }

//     try {
//       const {
//         data: { user },
//         error: userError,
//       } = await supabase.auth.getUser();

//       if (userError || !user) {
//         setStatus("You must be signed in to upload.");
//         return;
//       }

//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("user_id", user.id); 
//       formData.append("file_type", fileType);

//       const { data } = await axiosInstance.post("/uploads", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       setStatus(`✅ File uploaded successfully: ${data.upload.file_name}`);
//     } catch (error) {
//       if (error.response) {
//         setStatus(`❌ Error: ${error.response.data.error}`);
//       } else {
//         setStatus(`❌ Upload failed: ${error.message}`);
//       }
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Upload eDNA File</h2>
//       <form onSubmit={handleUpload}>
//         <div>
//           <label>Choose File: </label>
//           <input
//             type="file"
//             accept=".fasta,.fastq,.csv"
//             onChange={(e) => setFile(e.target.files[0])}
//           />
//         </div>

//         <div>
//           <label>File Type: </label>
//           <select
//             value={fileType}
//             onChange={(e) => setFileType(e.target.value)}
//           >
//             <option value="fasta">FASTA</option>
//             <option value="fastq">FASTQ</option>
//             <option value="csv">CSV</option>
//           </select>
//         </div>

//         <button type="submit" style={{ marginTop: "10px" }}>
//           Upload
//         </button>
//       </form>

//       {status && <p style={{ marginTop: "15px" }}>{status}</p>}
//     </div>
//   );
// };

// export default UploadPage;


import React, { useState } from "react";
import axiosInstance from "../lib/axios";
import { supabase } from "../lib/supabase.js";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("fasta");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState(null);

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
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus(`✅ File uploaded successfully: ${data.upload.file_name}`);
      setResults(data.result?.summary || null); // <-- ML results live here
    } catch (error) {
      if (error.response) {
        setStatus(`❌ Error: ${error.response.data.error}`);
      } else {
        setStatus(`❌ Upload failed: ${error.message}`);
      }
    }
  };

  // Prepare scatterplot data
  const scatterData =
    results?.results?.map((r) => ({
      cluster: r.cluster,
      silhouette: r.silhouette ?? 0,
      id: r.id,
    })) || [];

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

      {results && (
        <div style={{ marginTop: "30px" }}>
          <h3>Analysis Results</h3>
          <p>
            <b>Overall Silhouette:</b> {results.overall_silhouette ?? "N/A"}
          </p>

          {/* Scatterplot */}
          <ScatterChart
            width={800}
            height={400}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid />
            <XAxis type="number" dataKey="cluster" name="Cluster" />
            <YAxis type="number" dataKey="silhouette" name="Silhouette" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name="Sequences" data={scatterData} fill="#8884d8" />
          </ScatterChart>

          {/* Results Table */}
          <table border="1" cellPadding="6" style={{ marginTop: "20px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cluster</th>
                <th>Confidence</th>
                <th>Silhouette</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.id}</td>
                  <td>{r.cluster}</td>
                  <td>{r.confidence}</td>
                  <td>{r.silhouette ?? "-"}</td>
                  <td>{r.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
