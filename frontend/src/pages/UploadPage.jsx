import React, { useState,useEffect } from "react";
import axiosInstance from "../lib/axios";
import { supabase } from "../lib/supabase.js";
import Navbar from "../components/Navbar.jsx";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("fasta");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
      } else {
        setUser(data.user);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file.");
      return;
    }

    setIsUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("You must be signed in to upload.");
        setIsUploading(false);
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
      setResults(data.result?.summary || null);
    } catch (error) {
      if (error.response) {
        setStatus(`❌ Error: ${error.response.data.error}`);
      } else {
        setStatus(`❌ Upload failed: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Professional scientific color palette
  const colors = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#ea580c", "#0891b2"];

  // Prepare scatterplot data with colors
  const scatterData =
    results?.results?.map((r) => ({
      cluster: r.cluster,
      silhouette: r.silhouette ?? 0,
      id: r.id,
    })) || [];

  // Custom tooltip for scatter chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white p-3 rounded-lg border border-slate-600 shadow-lg">
          <p className="font-semibold text-blue-200">{`ID: ${payload[0].payload.id}`}</p>
          <p className="text-slate-200">{`Cluster: ${payload[0].value}`}</p>
          <p className="text-slate-200">{`Silhouette: ${payload[1].value.toFixed(3)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
    <Navbar user={user} setUser={setUser}/>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🧬 eDNA Analysis Platform
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '500' }}>
            Upload your genomic data for comprehensive machine learning analysis
          </p>
        </div>

        {/* Upload Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '32px'
        }}>
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? '#2563eb' : file ? '#059669' : '#94a3b8'}`,
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
              background: isDragging ? '#eff6ff' : file ? '#f0fdf4' : '#f8fafc',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                background: file ? '#059669' : '#64748b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <span style={{ fontSize: '40px', color: 'white' }}>
                  {file ? '✓' : '📁'}
                </span>
              </div>
            </div>

            <input
              type="file"
              accept=".fasta,.fastq,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
              {file ? (
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                    File Selected Successfully
                  </p>
                  <p style={{ fontSize: '18px', color: '#374151', fontWeight: '500' }}>{file.name}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                    Click or drag another file to replace
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Select or Drop Genomic Data File
                  </p>
                  <p style={{ fontSize: '16px', color: '#6b7280' }}>
                    Click to browse files or drag and drop
                  </p>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '16px' }}>
                    Supported formats: .fasta, .fastq, .csv
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* File Type Selection */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <label style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
              File Format
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['fasta', 'fastq', 'csv'].map((type) => (
                <button
                key={type}
                onClick={() => setFileType(type)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: fileType === type ? '2px solid #2563eb' : '2px solid #e2e8f0',
                  background: fileType === type ? '#2563eb' : '#f8fafc',
                  color: fileType === type ? 'white' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: fileType === type ? '0 2px 4px rgba(37,99,235,0.2)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !file}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              border: 'none',
              background: !file || isUploading ? '#94a3b8' : '#1e40af',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: !file || isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: !file || isUploading ? 'none' : '0 4px 6px rgba(30,64,175,0.2)',
            }}
            onMouseEnter={(e) => {
              if (file && !isUploading) {
                e.target.style.background = '#1d4ed8';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 10px rgba(30,64,175,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (file && !isUploading) {
                e.target.style.background = '#1e40af';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(30,64,175,0.2)';
              }
            }}
          >
            {isUploading ? '⏳ Processing Analysis...' : '🔬 Start Analysis'}
          </button>

          {/* Status Message */}
          {status && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '8px',
              background: status.includes('✅') ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${status.includes('✅') ? '#22c55e' : '#ef4444'}`,
              color: status.includes('✅') ? '#15803d' : '#dc2626',
              fontWeight: '500',
              animation: 'slideIn 0.3s ease'
            }}>
              {status}
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.5s ease'
          }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              📊 Analysis Results
            </h3>

            {/* Summary Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              color: 'white',
              border: '1px solid #1e3a8a'
            }}>
              <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#bfdbfe' }}>
                Overall Silhouette Score
              </p>
              <p style={{ fontSize: '36px', fontWeight: 'bold' }}>
                {results.overall_silhouette ?? "N/A"}
              </p>
            </div>

            {/* Scatter Plot */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '20px' }}>
                Cluster Distribution Analysis
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis 
                    type="number" 
                    dataKey="cluster" 
                    name="Cluster"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="silhouette" 
                    name="Silhouette"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Scatter name="Sequences" data={scatterData} fill="#2563eb">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[entry.cluster % colors.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Results Table */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              overflowX: 'auto',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '20px' }}>
                Detailed Classification Results
              </h4>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ padding: '14px 12px', color: 'white', textAlign: 'left', borderTopLeftRadius: '8px', fontWeight: '600' }}>Sequence ID</th>
                    <th style={{ padding: '14px 12px', color: 'white', textAlign: 'left', fontWeight: '600' }}>Cluster</th>
                    <th style={{ padding: '14px 12px', color: 'white', textAlign: 'left', fontWeight: '600' }}>Confidence</th>
                    <th style={{ padding: '14px 12px', color: 'white', textAlign: 'left', fontWeight: '600' }}>Silhouette Score</th>
                    <th style={{ padding: '14px 12px', color: 'white', textAlign: 'left', borderTopRightRadius: '8px', fontWeight: '600' }}>Classification Note</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((r, idx) => (
                    <tr key={idx} style={{
                      background: idx % 2 === 0 ? 'white' : '#f1f5f9',
                      transition: 'background 0.2s ease'
                    }}>
                      <td style={{ padding: '12px', color: '#374151', borderBottom: '1px solid #e2e8f0', fontWeight: '500' }}>{r.id}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: colors[r.cluster % colors.length],
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}></span>
                          <span style={{ color: '#374151', fontWeight: '500' }}>{r.cluster}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>{r.confidence}</td>
                      <td style={{ padding: '12px', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>{r.silhouette ?? "—"}</td>
                      <td style={{ padding: '12px', color: '#6b7280', borderBottom: '1px solid #e2e8f0', fontStyle: r.note ? 'normal' : 'italic' }}>{r.note ?? "No additional notes"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            }
            50% {
              opacity: 0.7;
              }
              }
              
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                    }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
              }
              }
              `}</style>
    </div>
              </>
  );
};

export default UploadPage;

