import client from '@/api/client';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  rawFile?: File;
  thumbnail?: string;
}

interface PDFUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
}

const PDFUpload = ({ onFilesUploaded }: PDFUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);




  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, []);

  const processFiles = useCallback((fileList: (File | Blob)[]) => {
  const pdfFiles = fileList
    .filter((file): file is File | Blob => !!file && 'type' in file)
    .map(file => {
      if (!(file instanceof File)) {
        console.warn("Blob detected — converting to File:", file);
        return new File([file], (file as any).name || "uploaded.pdf", { type: file.type });
      }
      return file;
    });

  if (pdfFiles.length !== fileList.length) {
    toast({
      title: "Invalid files detected",
      description: "Only PDF files are supported",
      variant: "destructive"
    });
  }

  const newFiles: UploadedFile[] = pdfFiles.map(file => ({
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: file.size,
    status: 'uploading',
    progress: 0,
    rawFile: file
  }));

  setFiles(prev => [...prev, ...newFiles]);

  newFiles.forEach(file => {
    uploadFile(file);
  });
}, [toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setIsDragging(false);

  // Explicitly tell TS this is File[]
  const droppedFiles: File[] = Array.from(e.dataTransfer.files);
  processFiles(droppedFiles);
}, [processFiles]);
  const uploadFile = useCallback(async (file: UploadedFile) => {
    if (!file.rawFile) return;

    const formData = new FormData();
    formData.append('pdf', file.rawFile);
    console.log("from pdf uploaod")

    //  const BASE_URL = "http://127.0.0.1:8000/"

    try {
     const response = await client.post('http://127.0.0.1:8000/api/pdf/extract-headings', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (progressEvent) => {
    if (progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setFiles(prev =>
        prev.map(f =>
          f.id === file.id ? { ...f, progress: percent } : f
        )
      );
    }
  }
});


      setFiles(prev =>
        prev.map(f =>
          f.id === file.id
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                thumbnail: `https://via.placeholder.com/120x160/6366f1/ffffff?text=PDF`
              }
            : f
        )
      );

      if (onFilesUploaded) {
        onFilesUploaded([file]);
      }
    } catch (error) {
      console.error(error);
      setFiles(prev =>
        prev.map(f =>
          f.id === file.id ? { ...f, status: 'error' } : f
        )
      );
    }
  }, [onFilesUploaded]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload PDFs
          </CardTitle>
          <CardDescription>
            Upload your PDF documents to start analyzing and connecting content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Drag and drop your PDFs here
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to browse your files
            </p>
            <Input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="pdf-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {file.thumbnail ? (
                      <img 
                        src={file.thumbnail} 
                        alt={file.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <Badge variant={
                        file.status === 'completed' ? 'default' : 
                        file.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {file.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {file.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="w-full" />
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFUpload;
