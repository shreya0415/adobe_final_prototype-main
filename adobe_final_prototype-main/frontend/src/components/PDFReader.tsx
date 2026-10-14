import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { FileText, Lightbulb, Sparkles, Volume2, Maximize, ZoomIn, ZoomOut, Highlighter } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './PDFReader.css';
import { useNavigate } from "react-router-dom";
// ✅ This is your correctly configured API client
import client from "@/api/client";

interface ExtractedItem {
  page: number;
  type: string;
  content: string;
}

interface PDFReaderProps {
  documentId?: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const PDFReader = ({ documentId }: PDFReaderProps) => {
  const [highlightMode, setHighlightMode] = useState(false);
  const navigate = useNavigate();
  const [pdfData, setPdfData] = useState<ExtractedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pdfInstanceRef = useRef<any>(null);
  const scaleRef = useRef(1.0);

  // Load PDF.js script (no changes here)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // PDF Rendering Logic (no changes here)
  const renderPDF = async (pdfUrl: string) => {
    if (!window.pdfjsLib || !pdfContainerRef.current) return;
    pdfContainerRef.current.innerHTML = '';
    const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    pdfInstanceRef.current = pdf;
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: scaleRef.current });
      const pageContainer = document.createElement("div");
      pageContainer.className = "pdf-page";
      pageContainer.style.position = "relative";
      pageContainer.style.width = ${viewport.width}px;
      pageContainer.style.height = ${viewport.height}px;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      pageContainer.appendChild(canvas);
      const textContent = await page.getTextContent();
      const textLayerDiv = document.createElement("div");
      textLayerDiv.className = "textLayer";
      Object.assign(textLayerDiv.style, { position: "absolute", left: "0", top: "0", height: ${viewport.height}px, width: ${viewport.width}px });
      (window as any).pdfjsLib.renderTextLayer({ textContent, container: textLayerDiv, viewport, textDivs: [] });
      pageContainer.appendChild(textLayerDiv);
      pdfContainerRef.current.appendChild(pageContainer);
    }
  };

  // ✅ THIS IS THE FIX:
  // This new function uses your central API client, ensuring the request is correct.
  const uploadAndRenderPDF = async (file: File) => {
    try {
      // Use the uploadPDF function from your configured client
      const result = await client.uploadPDF(file);
      setPdfData(result.data.outline || []); // Use the outline from the response

      // Create a URL from the file to render it in the viewer
      const fileUrl = URL.createObjectURL(file);
      renderPDF(fileUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  // Event handlers now call the corrected function
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadAndRenderPDF(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAndRenderPDF(e.target.files[0]);
    }
  };

  // Insights and Podcast logic (no changes here)
  let lastInsightsText = "";
  const openInsights = async () => { /* ... your existing code ... */ };
  const openPodcastMode = async () => { /* ... your existing code ... */ };
  const zoomIn = () => { scaleRef.current += 0.2; rerender(); };
  const zoomOut = () => { if (scaleRef.current > 0.4) { scaleRef.current -= 0.2; rerender(); } };
  const rerender = async () => { /* ... your existing code ... */ };
  
  // JSX Return (no changes to the structure)
  return (
    <div
      className="h-screen bg-gradient-subtle"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full flex flex-col">
            <div className="border-b border-border bg-glass-bg backdrop-blur-md px-4 py-3 flex justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-semibold">Upload a PDF</span>
                <input type="file" accept="application/pdf" className="hidden" id="pdfUpload" onChange={handleFileSelect} />
                <label htmlFor="pdfUpload">
                  <Badge variant="secondary" className="cursor-pointer">Choose File</Badge>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                {/* Zoom and other controls */}
              </div>
            </div>
            <div ref={pdfContainerRef} className="flex-1 overflow-auto p-2 bg-white"></div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <div className="h-full bg-glass-bg backdrop-blur-md border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-2">Extracted Content</h3>
              <p className="text-sm text-muted-foreground">Data extracted from the uploaded PDF</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pdfData.length > 0 ? (
                pdfData.map((item, idx) => (
                  <Card key={idx} variant="glass" className="cursor-pointer transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm leading-tight">
                        Page {item.page} — {item.type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{item.content}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No PDF uploaded yet</p>
              )}
            </div>
            <Separator />
            <div className="p-4 space-y-2">
              <Button onClick={openInsights} className="w-full justify-start" variant="outline">
                <Lightbulb className="w-4 h-4 mr-2" />
                Insights & Connections
                <Sparkles className="w-4 h-4 ml-auto" />
              </Button>
              <Button onClick={openPodcastMode} className="w-full justify-start" variant="outline">
                <Volume2 className="w-4 h-4 mr-2" />
                Podcast Mode
              </Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default PDFReader;



// import { useState, useEffect, useRef, useCallback } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
// import { FileText, Lightbulb, Sparkles, Volume2, Maximize, ZoomIn, ZoomOut, Highlighter } from 'lucide-react';
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import './PDFReader.css';
// import { useNavigate } from "react-router-dom";
// import client from "@/api/client";

// interface ExtractedItem {
//   page: number;
//   type: string;
//   content: string;
// }

// interface PDFReaderProps {
//   documentId?: string;
// }

// declare global {
//   interface Window {
//     pdfjsLib: any;
//   }
// }

// const PDFReader = ({ documentId }: PDFReaderProps) => {
//   const [scale, setScale] = useState(1);
//   const [highlightMode, setHighlightMode] = useState(false);

//   const toggleHighlight = () => setHighlightMode(v => !v);
//   const clearHighlights = () => {
//     const boxes = document.querySelectorAll('.highlight-box');
//     boxes.forEach((b) => b.remove());
//   };
//   const navigate = useNavigate();
//   const [isInsightsOpen, setIsInsightsOpen] = useState(false);
//   const [selectedPage, setSelectedPage] = useState<number | null>(null);
//   const [pdfData, setPdfData] = useState<ExtractedItem[]>([]);
//   const [isDragging, setIsDragging] = useState(false);

//   const pdfContainerRef = useRef<HTMLDivElement>(null);
//   const pdfInstanceRef = useRef<any>(null);
//   const scaleRef = useRef(1.0);

//   // Load PDF.js script
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
//     script.onload = () => {
//       window.pdfjsLib.GlobalWorkerOptions.workerSrc =
//         'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
//     };
//     document.head.appendChild(script);

//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   const renderPDF = async (pdfUrl: string) => {
//     if (!window.pdfjsLib || !pdfContainerRef.current) return;

//     pdfContainerRef.current.innerHTML = ''; // Clear previous

//     const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
//     const pdf = await loadingTask.promise;
//     pdfInstanceRef.current = pdf;

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const viewport = page.getViewport({ scale: scaleRef.current });

//       const canvas = document.createElement('canvas');
//       const context = canvas.getContext('2d') as CanvasRenderingContext2D;
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       await page.render({ canvasContext: context, viewport }).promise;

//       const pageContainer = document.createElement("div");
//       pageContainer.className = "pdf-page";
//       pageContainer.style.position = "relative";
//       pageContainer.style.width = ${viewport.width}px;
//       pageContainer.style.height = ${viewport.height}px;

//       pageContainer.appendChild(canvas);

//       const textContent = await page.getTextContent();
//       const textLayerDiv = document.createElement("div");
//       textLayerDiv.className = "textLayer";
//       textLayerDiv.style.position = "absolute";
//       textLayerDiv.style.left = "0";
//       textLayerDiv.style.top = "0";
//       textLayerDiv.style.height = ${viewport.height}px;
//       textLayerDiv.style.width = ${viewport.width}px;

//       (window as any).pdfjsLib.renderTextLayer({
//         textContent,
//         container: textLayerDiv,
//         viewport,
//         textDivs: [],
//       });

//       pageContainer.appendChild(textLayerDiv);
//       pdfContainerRef.current.appendChild(pageContainer);
//     }
//   };

//   // ✅ THIS IS THE CORRECTED FUNCTION
//   // It uses the configured Axios client from client.ts
//   const uploadAndRenderPDF = async (file: File) => {
//     try {
//       // Use the uploadPDF function from your configured client
//       const result = await client.uploadPDF(file);
//       setPdfData(result);

//       // Create a URL from the file to render it in the viewer
//       const fileUrl = URL.createObjectURL(file);
//       renderPDF(fileUrl);
//     } catch (err) {
//       console.error('Error uploading file:', err);
//     }
//   };

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     if (droppedFiles.length > 0) {
//       // ✅ Call the corrected function
//       uploadAndRenderPDF(droppedFiles[0]);
//     }
//   }, []);

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       // ✅ Call the corrected function
//       uploadAndRenderPDF(e.target.files[0]);
//     }
//   };

//   // Shared variable to store the last generated insights text
//   let lastInsightsText = "";

//   const openInsights = async () => {
//     if (!pdfData || pdfData.length === 0) {
//       console.warn("No extracted headings available.");
//       return;
//     }

//     const modal = document.createElement("div");
//     modal.className = "insights-modal";
//     modal.innerHTML = `<div class="insights-heading">📊 Insights</div>
//                          <div class="insights-loading">Loading...</div>`;
//     document.body.appendChild(modal);

//     try {
//       const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
//       const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//       const headings = pdfData
//         .filter(item => item.type === "heading")
//         .map(item => item.content)
//         .join("\n");

//       const prompt = `
//         Summarize these PDF headings in max 5 concise bullet points.
//         Include key themes and 1–2 recommended actions:
//         ${headings}
//       `;

//       const result = await model.generateContent(prompt);
//       const responseText = await result.response.text();

//       lastInsightsText = responseText;

//       modal.innerHTML = `<div class="insights-heading">📊 Insights</div>
//                            <pre style="white-space:pre-wrap;">${responseText}</pre>
//                            <button class="insights-close">Close</button>`;

//       modal.querySelector(".insights-close")?.addEventListener("click", () => {
//         modal.remove();
//       });

//     } catch (err) {
//       console.error("Error generating insights:", err);
//       modal.innerHTML = `<div class="insights-heading">📊 Insights</div>
//                            <p style="color:red;">Failed to load insights.</p>
//                            <button class="insights-close">Close</button>`;
//       modal.querySelector(".insights-close")?.addEventListener("click", () => {
//         modal.remove();
//       });
//     }
//   };

//   const openPodcastMode = async () => {
//     try {
//       if (!lastInsightsText) {
//         console.warn("No insights available to convert to podcast.");
//         return;
//       }

//       const modal = document.querySelector(".insights-modal");
//       if (modal) modal.remove();

//       const audioBlob = await client.generatePodcast(lastInsightsText);
//       const audioUrl = URL.createObjectURL(audioBlob);

//       navigate("/podcast-mode", {
//         state: {
//           audioUrl,
//           transcriptText: lastInsightsText || ""
//         }
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const zoomIn = () => {
//     scaleRef.current += 0.2;
//     rerender();
//   };

//   const zoomOut = () => {
//     if (scaleRef.current > 0.4) {
//       scaleRef.current -= 0.2;
//       rerender();
//     }
//   };

//   const rerender = async () => {
//     if (!pdfInstanceRef.current || !pdfContainerRef.current) return;

//     pdfContainerRef.current.innerHTML = '';
//     for (let pageNum = 1; pageNum <= pdfInstanceRef.current.numPages; pageNum++) {
//       const page = await pdfInstanceRef.current.getPage(pageNum);
//       const viewport = page.getViewport({ scale: scaleRef.current });

//       const canvas = document.createElement('canvas');
//       const context = canvas.getContext('2d') as CanvasRenderingContext2D;
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;
//       await page.render({ canvasContext: context, viewport }).promise;

//       const pageContainer = document.createElement('div');
//       pageContainer.className = 'pdf-page';
//       pageContainer.style.width = ${viewport.width}px;
//       pageContainer.style.height = ${viewport.height}px;
//       pageContainer.appendChild(canvas);

//       const textContent = await page.getTextContent();
//       const textLayerDiv = document.createElement('div');
//       textLayerDiv.className = 'textLayer';
//       textLayerDiv.style.height = ${viewport.height}px;
//       textLayerDiv.style.width = ${viewport.width}px;

//       (window as any).pdfjsLib.renderTextLayer({
//         textContent,
//         container: textLayerDiv,
//         viewport,
//         textDivs: [],
//       });

//       pageContainer.appendChild(textLayerDiv);
//       pdfContainerRef.current.appendChild(pageContainer);
//     }
//   };

//   return (
//     <div
//       className="h-screen bg-gradient-subtle"
//       onDragOver={(e) => {
//         e.preventDefault();
//         setIsDragging(true);
//       }}
//       onDragLeave={() => setIsDragging(false)}
//       onDrop={handleDrop}
//     >
//       <ResizablePanelGroup direction="horizontal" className="min-h-screen">
//         <ResizablePanel defaultSize={70} minSize={50}>
//           <div className="h-full flex flex-col">
//             <div className="border-b border-border bg-glass-bg backdrop-blur-md px-4 py-3 flex justify-between">
//               <div className="flex items-center space-x-2">
//                 <FileText className="w-5 h-5 text-primary" />
//                 <span className="font-semibold">Upload a PDF</span>
//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   className="hidden"
//                   id="pdfUpload"
//                   onChange={handleFileSelect}
//                 />
//                 <label htmlFor="pdfUpload">
//                   <Badge variant="secondary" className="cursor-pointer">Choose File</Badge>
//                 </label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Button
//                   variant={highlightMode ? "default" : "outline"}
//                   size="sm"
//                   onClick={toggleHighlight}
//                   title="Toggle highlight mode"
//                 >
//                   <Highlighter className="w-4 h-4" />
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={clearHighlights} title="Clear highlights">
//                   Clear
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={zoomOut}>
//                   <ZoomOut className="w-4 h-4" />
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={zoomIn}>
//                   <ZoomIn className="w-4 h-4" />
//                 </Button>
//                 <Button variant="outline" size="sm">
//                   <Maximize className="w-4 h-4" />
//                 </Button>

//               </div>
//             </div>
//             <div ref={pdfContainerRef} className="flex-1 overflow-auto p-2 bg-white"></div>
//           </div>
//         </ResizablePanel>

//         <ResizableHandle withHandle />

//         <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
//           <div className="h-full bg-glass-bg backdrop-blur-md border-l border-border flex flex-col">
//             <div className="p-4 border-b border-border">
//               <h3 className="font-semibold mb-2">Extracted Content</h3>
//               <p className="text-sm text-muted-foreground">Data extracted from the uploaded PDF</p>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//               {pdfData.length > 0 ? (
//                 pdfData.map((item, idx) => (
//                   <Card
//                     key={idx}
//                     variant="glass"
//                     className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedPage === item.page ? 'ring-2 ring-primary' : ''
//                       }`}
//                     onClick={() => setSelectedPage(item.page)}
//                   >
//                     <CardHeader className="pb-3">
//                       <CardTitle className="text-sm leading-tight">
//                         Page {item.page} — {item.type}
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <p className="text-sm">{item.content}</p>
//                     </CardContent>
//                   </Card>
//                 ))
//               ) : (
//                 <p className="text-sm text-muted-foreground">No PDF uploaded yet</p>
//               )}
//             </div>
//             <Separator />
//             <div className="p-4 space-y-2">
//               <Button onClick={openInsights} className="w-full justify-start" variant="outline">
//                 <Lightbulb className="w-4 h-4 mr-2" />
//                 Insights & Connections
//                 <Sparkles className="w-4 h-4 ml-auto" />
//               </Button>
//               <Button onClick={openPodcastMode} className="w-full justify-start" variant="outline">
//                 <Volume2 className="w-4 h-4 mr-2" />
//                 Podcast Mode
//               </Button>
//             </div>
//           </div>
//         </ResizablePanel>
//       </ResizablePanelGroup>
//     </div>
//   );
// };

// export default PDFReader;