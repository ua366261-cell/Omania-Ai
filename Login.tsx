import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Globe, LogIn } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'pa', name: 'Punjabi (پنجابی)' },
  { code: 'skr', name: 'Saraiki (سرائیکی)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'es', name: 'Spanish (Español)' },
];

export const Login: React.FC = () => {
  const { user, profile, login, updateLanguage } = useAuth();
  const [selectedLang, setSelectedLang] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await login(name.trim());
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetupLanguage = async () => {
    if (!selectedLang) return;
    setIsUpdating(true);
    await updateLanguage(selectedLang);
    setIsUpdating(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-[#F5F5F5] font-sans p-4 relative overflow-hidden">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-2xl blur opacity-20"></div>
        <div className="relative z-10 w-full max-w-md p-8 bg-[#111] border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-black rounded-sm rotate-45" />
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Welcome to <span className="font-serif italic opacity-70">Omnia</span></h1>
          <p className="text-white/40 mb-10 text-center">Your all-in-one platform for Audio, Video, Image, and Chat AI generation.</p>
          
          <button 
            type="button"
            onClick={() => alert("Google Login is coming soon! Please Continue as Guest for now.")}
            className="w-full py-4 bg-white hover:bg-white/90 text-black rounded-xl font-medium transition-colors flex items-center justify-center gap-3 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="w-full flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/40 text-sm">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter your name to play as Guest"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-4 px-4 bg-transparent border border-white/20 text-white rounded-xl focus:outline-none focus:border-white/50 transition-colors"
              required
            />
            <button 
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              Continue as Guest
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If logged in but hasn't selected language yet
  if (profile && !profile.preferredLanguage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-[#F5F5F5] font-sans p-4 relative overflow-hidden">
         <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-2xl blur opacity-10"></div>
         <div className="relative z-10 w-full max-w-md p-8 bg-[#111] border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 text-white">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-light mb-2">Select Your Language</h2>
          <p className="text-white/40 mb-8 text-center text-sm">Choose the primary language you want to interact with Omnia in.</p>
          
          <div className="w-full grid grid-cols-2 gap-3 mb-8">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  selectedLang === lang.code 
                  ? 'bg-white text-black border-white' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <button 
            onClick={handleSetupLanguage}
            disabled={!selectedLang || isUpdating}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            {isUpdating ? 'Saving...' : 'Continue'}
          </button>
         </div>
      </div>
    );
  }

  return null;
};
