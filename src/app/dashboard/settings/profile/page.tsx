"use client";

import { useState, useEffect, useRef } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setName(data.user.name || "");
        setPhone(data.user.phone || "");
        setBio(data.user.bio || "");
        setAvatarUrl(data.user.avatarUrl || "");
      }
    } catch (e) {
      console.error("Error fetching profile", e);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, bio, avatarUrl })
      });
      if (res.ok) {
        alert("Profile updated successfully! Refresh the page to see sidebar updates.");
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Maximum size is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Your Profile</h1>
        <p className="text-zinc-400 mt-1">Manage your personal information, avatar, and settings.</p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-8 space-y-8">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-8 border-b border-zinc-800/60">
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white">
                  {name ? name.charAt(0).toUpperCase() : profile?.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif" 
                onChange={handleFileChange} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100">Profile Picture</h3>
              <p className="text-sm text-zinc-400 mt-1">PNG, JPG or GIF. Max 2MB.</p>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-1.5 bg-zinc-950/50 border border-zinc-700/50 text-sm font-medium text-zinc-300 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                Upload new image
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-zinc-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email Address</label>
              <input 
                type="email" 
                value={profile?.email || ""}
                disabled
                className="w-full border border-zinc-700/50 bg-zinc-950/50 rounded-xl shadow-sm text-zinc-400 px-4 py-2 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-zinc-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 outline-none transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Role / Job Title</label>
              <input 
                type="text" 
                value={profile?.role || "Team Member"}
                disabled
                className="w-full border border-zinc-700/50 bg-zinc-950/50 rounded-xl shadow-sm text-zinc-400 px-4 py-2 cursor-not-allowed uppercase"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-1">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border border-zinc-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 outline-none transition-all resize-none"
                placeholder="Write a few sentences about yourself..."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/60 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all ${
                saving
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
