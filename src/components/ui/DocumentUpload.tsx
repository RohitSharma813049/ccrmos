"use client";

import React, { useState, useRef } from "react";
import { Upload, X, File, FileText, Image as ImageIcon, FileArchive } from "lucide-react";
import { toast } from "react-hot-toast";

export interface DocumentInfo {
  url: string;
  name: string;
  format: string;
}

interface DocumentUploadProps {
  documents: DocumentInfo[];
  onChange: (docs: DocumentInfo[]) => void;
  maxFiles?: number;
}

export default function DocumentUpload({ documents = [], onChange, maxFiles = 10 }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (documents.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    setUploading(true);
    const newDocs: DocumentInfo[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        
        newDocs.push({
          url: data.url,
          name: file.name,
          format: file.type || "unknown"
        });
      }

      onChange([...documents, ...newDocs]);
      toast.success("Documents uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload some documents");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = [...documents];
    newDocs.splice(index, 1);
    onChange(newDocs);
  };

  const getFileIcon = (format: string) => {
    if (format.includes("image")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (format.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (format.includes("zip") || format.includes("tar") || format.includes("rar")) return <FileArchive className="w-5 h-5 text-yellow-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-foreground mb-1">Click to upload documents</h4>
        <p className="text-sm text-muted-foreground mb-4">Support for PDF, DOCX, Images, ZIP, etc. (Any format)</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          multiple 
          disabled={uploading}
        />
        {uploading && (
          <div className="text-sm font-medium text-primary animate-pulse">Uploading files, please wait...</div>
        )}
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                {getFileIcon(doc.format)}
                <span className="text-sm font-medium text-slate-700 truncate">{doc.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium">View</a>
                <button 
                  type="button" 
                  onClick={() => removeDocument(index)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
