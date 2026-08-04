"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const seenNotifIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request desktop notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }

    fetchNotifications();

    // Poll for new notifications every 15 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 15000);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  async function fetchNotifications(isPolling = false) {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const newNotifs = data.notifications || [];
        
        if (isPolling) {
          // Check for brand new unread notifications we haven't seen yet
          newNotifs.forEach((n: any) => {
            if (!n.isRead && !seenNotifIds.current.has(n._id)) {
              // Trigger desktop notification
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                const notif = new Notification(n.title, { body: n.message, icon: "/favicon.ico" });
                if (n.link) {
                  notif.onclick = () => {
                    window.open(n.link, '_blank');
                  };
                }
              }
            }
          });
        }
        
        // Update seen set
        newNotifs.forEach((n: any) => seenNotifIds.current.add(n._id));
        setNotifications(newNotifs);
      }
    } catch (e: any) {
      // Ignore network errors which often happen during dev server restarts or Turbopack recompiles
      if (e?.name !== "TypeError" || e?.message !== "Failed to fetch") {
        console.error("Failed to fetch notifications:", e);
      }
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id?: string) {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { notificationId: id } : {})
      });
      fetchNotifications();
    } catch (e: any) {
      if (e?.name !== "TypeError" || e?.message !== "Failed to fetch") {
        console.error("Failed to mark notification as read:", e);
      }
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
      >
        {unreadCount > 0 && (
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-card animate-pulse" />
        )}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead()} 
                className="text-xs text-primary hover:text-primary/80 font-medium focus-visible:outline-none focus-visible:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                >
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notif.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                  <div>
                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
