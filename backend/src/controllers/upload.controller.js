import { supabase } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import FormData from "form-data";

const ML_API = "https://huggingface.co/spaces/KartikB34/DNA_Cluster_Analyzer";


export const handleFileUpload = async (req, res) => {
  try {
    const { user_id, file_type } = req.body;
    const file = req.file;

    if (!file || !user_id || !file_type) {
      return res.status(400).json({ error: "user_id, file_type, and file are required" });
    }

    if (!["fasta", "fastq", "csv"].includes(file_type.toLowerCase())) {
      return res.status(400).json({ error: "Invalid file type. Allowed: fasta, fastq, csv" });
    }

    const ext = file.originalname.split(".").pop();
    const uniqueName = `${uuidv4()}.${ext}`;
    const storagePath = `uploads/${uniqueName}`;

    const { error: storageError } = await supabase.storage
      .from("uploads")
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (storageError) throw storageError;

    const { data, error: dbError } = await supabase
  .from("uploads")
  .insert([
    {
      user_id,
      file_name: file.originalname,
      file_type,
      file_path: storagePath,
      status: "pending",
    },
  ])
  .select()
  .single();

if (dbError) throw dbError;

// Call ML
const form = new FormData();
form.append("file", file.buffer, {
  filename: file.originalname,
  contentType: file.mimetype,
});

let mlData = null;
let status = "completed";
try {
  const response = await axios.post(`${ML_API}/predict_fasta`, form, {
    headers: form.getHeaders(),
  });
  mlData = response.data;
} catch (mlErr) {
  console.error("ML API Error:", mlErr.response?.data || mlErr.message);
  status = "failed";
}

// Insert into results if success
let resultRow = null;
if (status === "completed") {
  const myuuid = uuidv4();
  const { data: resultData, error: resultError } = await supabase
    .from("results")
    .insert([
      {
        id: myuuid,
        upload_id: data.id,
        summary: mlData,
        report_path: null,
      },
    ])
    .select()
    .single();

  if (resultError) throw resultError;
  resultRow = resultData;

  // Update uploads with result_id + status
  await supabase.from("uploads").update({
    status,
    result_id: myuuid,
  }).eq("id", data.id);
} else {
  await supabase.from("uploads").update({
    status,
  }).eq("id", data.id);
}

res.status(201).json({
  message: "File uploaded and processed",
  upload: data,
  result: resultRow,
});

  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllUploads = async (req, res) => {
  try {
    const { user_id } = req.query;

    let query = supabase.from("uploads").select("*").order("uploaded_at", { ascending: false });

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    // Get upload info
    const { data: upload, error: fetchError } = await supabase
      .from("uploads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from("uploads")
      .remove([upload.file_path]);

    if (storageError) throw storageError;

    // Delete record from DB
    const { error: dbError } = await supabase.from("uploads").delete().eq("id", id);
    if (dbError) throw dbError;

    res.json({ message: `Upload with id ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};