"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";

export default function TeamsClient() {
  const [teams, setTeams] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [teamsRes, deptsRes] = await Promise.all([
        fetch("/api/companies/teams"),
        fetch("/api/companies/departments?limit=100")
      ]);
      
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData.teams || []);
      }
      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(deptsData.departments || []);
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    }
    setLoading(false);
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/companies/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, departmentId })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setDepartmentId("");
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to create team: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteTeam(id: string) {
    if (!confirm("Delete this team?")) return;
    try {
      await fetch(`/api/companies/teams/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader
        title="Teams Management"
        description="Create teams within departments and assign options."
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Team
        </button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center p-12 text-zinc-400">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-12 text-center shadow-sm">
          <h3 className="text-lg font-bold text-zinc-100 mb-2">No Teams Found</h3>
          <p className="text-zinc-400">You haven't created any teams yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map(team => (
            <div key={team._id} className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 shadow-sm flex flex-col relative group">
              <button onClick={() => deleteTeam(team._id)} className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <h3 className="text-xl font-bold text-zinc-100 mb-1">{team.name}</h3>
              <p className="text-sm text-zinc-400 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {team.departmentId?.name || "Unknown Department"}
              </p>
              
              <div className="mt-auto pt-4 border-t border-zinc-800/60">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Members</p>
                {team.members?.length > 0 ? (
                  <div className="flex -space-x-2">
                    {team.members.map((m: any) => (
                      <div key={m._id} className="w-8 h-8 rounded-full border-2 border-white bg-primary/20 flex items-center justify-center text-xs font-bold text-primary" title={m.name}>
                        {m.name.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">No members assigned.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-700/50">
              <h2 className="text-xl font-bold text-zinc-100">Create Team</h2>
              <p className="text-sm text-zinc-400 mt-1">Group users into a functional team.</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={createTeam}>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Team Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Department <span className="text-red-500">*</span></label>
                <select 
                  required 
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none" 
                >
                  <option value="">Select a Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800/60 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-lg transition-all">
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
