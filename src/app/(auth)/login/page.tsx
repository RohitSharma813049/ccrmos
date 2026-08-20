import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
      <LoginForm />
      
      <p className="mt-8 text-center text-sm text-zinc-500">
        Don't have an account?{' '}
        <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          Request early access
        </a>
      </p>
    </div>
  );
}
