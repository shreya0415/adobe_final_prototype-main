import { useState, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Eye, Calendar, HardDrive, Upload, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- INTERFACES ---
interface PDFDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  uploadDate: Date;
  thumbnail: string;
  pages: number;
  tags?: string[];
  description?: string;
  url: string;
}

// ✅ This interface matches your backend's JSON response structure
interface AnalysisResults {
  persona: string;
  task: string;
  documents: {
    name: string;
    highlights: string;
  }[];
  summary: string;
}


// --- NEW: RESULTS MODAL COMPONENT ---
// This component will display the formatted analysis in a popup.
const ResultsModal = ({ results, onClose }: { results: AnalysisResults; onClose: () => void; }) => {
  // ✅ This function converts your JSON object into a clean, readable text format.
  const formatResultsToText = (data: AnalysisResults): string => {
    let output = `Persona Analysis Report\n`;
    output += `=========================\n\n`;
    output += `👤 Persona: ${data.persona}\n`;
    output += `🎯 Task: ${data.task}\n\n`;
    output += `-------------------------\n`;
    output += `📄 Document Highlights\n`;
    output += `-------------------------\n\n`;

    data.documents.forEach(doc => {
      output += `📌 File: ${doc.name}\n`;
      output += `✨ Highlights:\n${doc.highlights}\n\n`;
    });

    output += `-------------------------\n`;
    output += `💡 Final Summary\n`;
    output += `-------------------------\n\n`;
    output += `${data.summary}\n`;

    return output;
  };

  const formattedText = formatResultsToText(results);

  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      
      {/* ✅ THIS IS THE LINE I CHANGED to add the glow and new styling */}
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-gray-900/90 border border-purple-500/20 text-white shadow-[0_0_60px_10px_rgba(168,85,247,0.3)]">
        
        <CardHeader className="flex flex-row items-center justify-between border-b border-purple-500/20">
          <CardTitle>Analysis Results</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-purple-500/20">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 flex-grow overflow-y-auto">
          <pre className="text-base bg-black/30 p-4 rounded-md whitespace-pre-wrap font-sans">
            {formattedText}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};


// --- MAIN PDF LIBRARY COMPONENT ---
const PDFLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [persona, setPersona] = useState('');
  const [job, setJob] = useState('');
  
  // ✅ State now expects the structured AnalysisResults type
  const [results, setResults] = useState<AnalysisResults | null>(null);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(date);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploadedDocs: PDFDocument[] = Array.from(e.target.files).map((file, idx) => ({
      id: Date.now() + '-' + idx,
      file,
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
      thumbnail: 'https://via.placeholder.com/200x260/3b82f6/ffffff?text=PDF',
      pages: 0,
      tags: [],
      description: '',
      url: URL.createObjectURL(file),
    }));
    setDocuments(prev => [...prev, ...uploadedDocs]);
  };

  const processDocuments = async () => {
    if (!persona || !job || documents.length === 0) {
      alert("Please upload PDFs, enter a persona, and specify the job to be done.");
      return;
    }

    setLoading(true);
    setResults(null); // Clear previous results
    try {
      const formData = new FormData();
      formData.append("persona", persona);
      formData.append("task", job);
      documents.forEach((doc) => {
        formData.append("files", doc.file);
      });

      const res = await fetch("/api/persona-intelligence", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Server error ${res.status}: ${errorData.detail || 'Unknown error'}`);
      }

      const data: AnalysisResults = await res.json();
      setResults(data); // ✅ Set the structured data to trigger the modal
    } catch (err: any) {
      console.error(err);
      alert(`Processing failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // This function is no longer needed as the modal handles display
  // const downloadJSON = () => { ... };

  const openPDF = (documentId: string) => {
    navigate('/pdf-reader', { state: { documentId } });
  };

  return (
    <Fragment>
      {/* ✅ The results modal will appear here when `results` is not null */}
      {results && <ResultsModal results={results} onClose={() => setResults(null)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Persona Analysis</h2>
            <p className="text-muted-foreground">
              Upload and process documents for persona-driven analysis
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {documents.length} documents
          </Badge>
        </div>

        {/* Persona & Job Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Enter persona (e.g., PhD Researcher)"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            />
            <Input
              placeholder="Enter job to be done"
              value={job}
              onChange={(e) => setJob(e.target.value)}
            />
            <Input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileUpload}
            />
            <Button onClick={processDocuments} disabled={loading}>
              {loading ? "Processing..." : "Process Documents"}
            </Button>
          </CardContent>
        </Card>

        {/* Search and Document List (no changes here) */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} variant="glass" className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                <div className="aspect-[3/4] bg-gradient-to-br from-muted/50 to-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={doc.thumbnail}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold line-clamp-2 mb-1">{doc.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatFileSize(doc.size)}</div>
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(doc.uploadDate)}</div>
                  </div>
                  <Button className="w-full" onClick={() => openPDF(doc.id)}>
                    <Eye className="w-4 h-4 mr-2" /> Open PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card variant="glass">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Upload your first PDF to get started"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Fragment>
  );
};

export default PDFLibrary;
