import { useLocation } from "react-router-dom";
import PDFReader from "@/components/PDFReader";
import InsightsPanel from "@/components/InsightsPanel";
import { useState } from "react";
import client from "@/api/client"; // adjust path if needed

const PDFReaderPage = () => {
  const location = useLocation();
  const { documentId } = location.state || {};
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [outline, setOutline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setLoading(true);
      const data = await client.uploadPDF(file); // sends to backend
      setOutline(data.outline || []); // save outline from backend
      setIsInsightsOpen(true); // optionally open the insights panel
    } catch (err) {
      console.error(err);
      alert("PDF upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={loading}
      />
      {loading && <p>Uploading & processing PDF...</p>}

      <PDFReader documentId={documentId} />

      <InsightsPanel
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      >
        <h3>Extracted Outline</h3>
        <ul>
          {outline.map((item, idx) => (
            <li key={idx}>
              <strong>{item.level}</strong>: {item.text} (Page {item.page})
            </li>
          ))}
        </ul>
      </InsightsPanel>
    </>
  );
};

export default PDFReaderPage;
