import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

// Create an Axios instance
const client = axios.create({
  baseURL: API_BASE_URL,
});

// Function to upload a PDF and extract headings in one go
async function uploadPDF(file: File) {
  console.log(file instanceof File, file);
  const formData = new FormData();
  formData.append("pdf", file);

  // ✅ THE FIX IS HERE:
  // The `headers` object has been removed. The browser will now
  // automatically set the correct Content-Type with the required boundary.
  const res = await client.post("/api/pdf/extract-headings", formData);
  
  console.log("api hit");
  console.log(res.data);
  return res.data;
}

/* -------------------- NEW: Podcast Mode -------------------- */
// Function to generate audio (podcast mode) from text
async function generatePodcast(text: string, voice: string = "alloy") {
  try {
    // This function is correct
    const res = await client.post(
      "/api/podcast",
      { text, voice },
      { responseType: "blob" } // Important for audio files
    );
    return res.data; // This will be an audio Blob
  } catch (err) {
    console.error("Podcast generation failed:", err);
    throw err;
  }
}

// Attach helper functions to the Axios instance
export default Object.assign(client, { uploadPDF, generatePodcast });
