"use client";

import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PushManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      // Check current subscription status
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    try {
      // First ensure the browser supports notifications
      if (!('Notification' in window)) {
        toast.error("This browser does not support desktop notifications.");
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error("Notification permission denied.");
        return;
      }

      const { initializeFirebaseMessaging } = await import('@/lib/firebase');
      const { getToken } = await import('firebase/messaging');
      
      const messaging = await initializeFirebaseMessaging();
      if (!messaging) {
        toast.error("Firebase messaging is not supported in this browser.");
        return;
      }

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";
      
      const currentToken = await getToken(messaging, { vapidKey: publicVapidKey });
      
      if (!currentToken) {
        toast.error("No registration token available. Request permission to generate one.");
        return;
      }

      // Send the token to the backend
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: currentToken }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        toast.success("Successfully subscribed to notifications!");
      } else {
        throw new Error("Failed to save subscription on server");
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      toast.error("Failed to enable notifications. Please check your browser permissions.");
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={subscribeToPush}
      disabled={isSubscribed}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isSubscribed 
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
    >
      {isSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      {isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
    </button>
  );
}
