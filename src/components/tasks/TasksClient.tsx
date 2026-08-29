'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, Search, Calendar, Flag, MoreHorizontal, User, Filter, AlertCircle } from 'lucide-react';
import { getTasks, createTask, toggleTaskStatus } from '@/app/dashboard/tasks/actions';
import { toast } from 'react-hot-toast';

export function TasksClient() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'My Tasks' | 'Completed'>('My Tasks');
  const [isCreating, setIsCreating] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTaskStatus = async (id: string, currentStatus: string) => {
    // Optimistic UI update
    setTasks(tasks.map(t => 
      t._id === id ? { ...t, status: currentStatus === 'Open' ? 'Completed' : 'Open' } : t
    ));
    
    try {
      await toggleTaskStatus(id);
    } catch (error) {
      toast.error('Failed to update task');
      // Revert on failure
      fetchTasks();
    }
  };

  const handleCreateTestTask = async () => {
    setIsCreating(true);
    try {
      await createTask({
        title: `Test Task ${Math.floor(Math.random() * 1000)}`,
        status: 'Open',
        priority: ['Urgent', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
        category: ['Call', 'Meeting', 'Admin', 'Follow Up'][Math.floor(Math.random() * 4)],
        dueDate: new Date(Date.now() + Math.random() * 864000000).toISOString()
      });
      toast.success('Task created');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Basic assignment simulation since we don't have active user context easily in this client component without providers
    const isAssigneeMe = true; 
    
    if (activeTab === 'My Tasks' && (!isAssigneeMe || task.status === 'Completed')) return false;
    if (activeTab === 'Completed' && task.status !== 'Completed') return false;
    if (activeTab === 'All' && task.status === 'Completed') return false; // Default 'All' hides completed unless on 'Completed' tab
    
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'High': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Low': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Call': return 'text-emerald-400';
      case 'Meeting': return 'text-purple-400';
      case 'Admin': return 'text-indigo-400';
      case 'Follow Up': return 'text-cyan-400';
      default: return 'text-zinc-400';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60 p-1 rounded-xl">
          {['My Tasks', 'All', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-zinc-800/80 text-zinc-100 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-zinc-900/50 border border-zinc-800/60 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button 
            disabled={isCreating}
            onClick={handleCreateTestTask}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-zinc-800/60 bg-zinc-950/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider items-center">
          <div className="w-5"></div>
          <div>Task Name</div>
          <div className="w-24 hidden md:block">Category</div>
          <div className="w-24">Priority</div>
          <div className="w-32 hidden sm:block">Due Date</div>
          <div className="w-8"></div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12">
              <Check className="w-12 h-12 text-zinc-800 mb-4" />
              <p className="text-lg font-medium text-zinc-300">You're all caught up!</p>
              <p className="text-sm mt-1 text-center max-w-sm">
                No tasks found in this view. Enjoy your day or create a new task to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const assigneeName = task.assignee?.name || task.assignee?.email || 'Unknown';
                const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date';

                return (
                  <div 
                    key={task._id} 
                    className={`group grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 rounded-xl items-center transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-zinc-900/20 hover:bg-zinc-900/40 opacity-60' 
                        : 'hover:bg-zinc-800/50 bg-zinc-950/20'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleTaskStatus(task._id, task.status); }}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          isCompleted 
                            ? 'bg-indigo-500 text-white' 
                            : 'border border-zinc-600 bg-zinc-900/50 hover:border-indigo-400 group-hover:bg-zinc-800'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Title & Assignee */}
                    <div className="min-w-0 flex flex-col">
                      <span className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 sm:hidden">
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority || 'Medium'}
                        </span>
                        <span className="text-xs text-zinc-500">{dateStr}</span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="w-24 hidden md:flex items-center gap-1.5">
                      <span className={`text-xs font-medium ${getCategoryColor(task.category || 'General')}`}>
                        {task.category || 'General'}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="w-24 hidden sm:block">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'Urgent' && <AlertCircle className="w-3 h-3" />}
                        {task.priority || 'Medium'}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="w-32 hidden sm:flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      <span>{dateStr}</span>
                    </div>

                    {/* Actions */}
                    <div className="w-8 flex justify-end">
                      <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
