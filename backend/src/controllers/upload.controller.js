import { supabase } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

export const handleFileUpload = async (req, res) => {
  try {
    const { user_id, file_type } = req.body;
    const file = req.file;

    if (!file || !user_id || !file_type) {
      return res.status(400).json({ error: "user_id, file_type, and file are required" });
    }

    // Ensure file_type is valid
    if (!["fasta", "fastq", "csv"].includes(file_type.toLowerCase())) {
      return res.status(400).json({ error: "Invalid file type. Allowed: fasta, fastq, csv" });
    }

    // Generate unique filename & path
    const ext = file.originalname.split(".").pop();
    const uniqueName = `${uuidv4()}.${ext}`;
    const storagePath = `uploads/${uniqueName}`;

    // Upload file to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("uploads")
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (storageError) throw storageError;

    // Save record in `uploads` table (status = pending)
    const { data, error: dbError } = await supabase
      .from("uploads")
      .insert([
        {
          user_id,
          file_name: file.originalname,
          file_type: file_type,
          file_path: storagePath,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    res.status(201).json({
      message: "File uploaded successfully",
      upload: data,
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
