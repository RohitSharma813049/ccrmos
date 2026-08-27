"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'react-hot-toast';

export default function DocumentsClient() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<{id: string | null, name: string}[]>([{id: null, name: 'Home'}]);

  // Modal State
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async (parentId: string | null = null) => {
    setLoading(true);
    try {
      const url = `/api/documents?parentId=${parentId || 'null'}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentFolderId);
  }, [currentFolderId]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          type: 'folder',
          parentId: currentFolderId
        })
      });

      if (res.ok) {
        toast.success("Folder created!");
        setIsNewFolderModalOpen(false);
        setNewFolderName('');
        fetchDocuments(currentFolderId);
      } else {
        toast.error("Failed to create folder");
      }
    } catch (e) {
      toast.error("Error creating folder");
    }
  };


  const handleDelete = async (id: string, name: string, type: string) => {
    if (!confirm(`Are you sure you want to delete ${type === 'folder' ? 'this folder and all its contents' : name}?`)) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchDocuments(currentFolderId);
      } else {
        toast.error("Failed to delete");
      }
    } catch (e) {
      toast.error("Error deleting");
    }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setFolderHistory([...folderHistory, { id: folderId, name: folderName }]);
  };

  const navigateUp = (index: number) => {
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    setCurrentFolderId(newHistory[newHistory.length - 1].id);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '--';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Documents" 
          description="Manage contracts, assets, and files." 
        />
        <div className="flex gap-2">
          <button 
            onClick={() => setIsNewFolderModalOpen(true)}
            className="px-4 py-2 bg-card border border-border hover:bg-muted text-foreground rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            New Folder
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Upload File
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 p-3 rounded-xl border border-border/50">
        {folderHistory.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span>/</span>}
            <button 
              onClick={() => navigateUp(idx)}
              className={`hover:text-primary transition-colors ${idx === folderHistory.length - 1 ? 'font-semibold text-foreground' : ''}`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="animate-pulse bg-card h-32 rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-16 text-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(225,29,72,0.15)] border border-white/5 relative z-10">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-100 mb-2 relative z-10">This folder is empty</h3>
          <p className="text-zinc-500 text-sm relative z-10 max-w-sm mx-auto">Upload files or create folders to organize your documents cleanly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {documents.map((doc) => (
            <div 
              key={doc._id} 
              className="bg-card hover:bg-muted/30 border border-border hover:border-primary/50 transition-all rounded-2xl p-4 flex flex-col group relative"
            >
              {/* Delete Button (visible on hover) */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(doc._id, doc.name, doc.type); }}
                className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>

              <div 
                className="flex-1 flex flex-col items-center justify-center cursor-pointer mb-3"
                onClick={() => doc.type === 'folder' ? navigateToFolder(doc._id, doc.name) : window.open(doc.fileUrl, '_blank')}
              >
                {doc.type === 'folder' ? (
                  <svg className="w-14 h-14 text-indigo-500 mb-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 7H12L10.553 4.106A1 1 0 009.658 3.5H4A2 2 0 002 5.5v13A2 2 0 004 20.5h16a2 2 0 002-2v-9A2 2 0 0020 7z" />
                  </svg>
                ) : (
                  <svg className="w-14 h-14 text-emerald-500 mb-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <path fill="rgba(255,255,255,0.2)" d="M14 2v6h6" />
                  </svg>
                )}
                <h4 className="font-semibold text-sm text-foreground text-center line-clamp-2 w-full leading-snug">{doc.name}</h4>
              </div>
              <div className="flex justify-between items-center w-full border-t border-border/50 pt-2 mt-auto">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">{doc.type}</span>
                <span className="text-[10px] text-muted-foreground">{doc.type === 'file' ? formatSize(doc.size) : '--'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsNewFolderModalOpen(false)} />
          <form onSubmit={handleCreateFolder} className="relative bg-zinc-950/90 backdrop-blur-xl w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-zinc-100 mb-4">New Folder</h3>
            <input 
              autoFocus
              required 
              type="text" 
              value={newFolderName} 
              onChange={e => setNewFolderName(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner mb-6" 
              placeholder="Folder Name" 
            />
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setIsNewFolderModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">Cancel</button>
              <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-colors">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsUploadModalOpen(false)} />
          <div className="relative bg-zinc-950/90 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Upload File</h3>
            <p className="text-sm text-zinc-500 mb-6">Select a file to upload into the current folder.</p>
            
            <input 
              type="file" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading(true);
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  
                  const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                  });

                  if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    
                    const res = await fetch('/api/documents', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: file.name,
                        type: 'file',
                        size: file.size,
                        mimeType: file.type || 'application/octet-stream',
                        fileUrl: uploadData.url,
                        parentId: currentFolderId
                      })
                    });

                    if (res.ok) {
                      toast.success("File uploaded successfully!");
                      setIsUploadModalOpen(false);
                      fetchDocuments(currentFolderId);
                    } else {
                      toast.error("Failed to save document metadata");
                    }
                  } else {
                     toast.error("Failed to upload file");
                  }
                } catch (err) {
                  toast.error("Upload error");
                } finally {
                  setIsUploading(false);
                }
              }} 
              disabled={isUploading}
              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 mb-6" 
            />
            
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading} className="px-5 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
