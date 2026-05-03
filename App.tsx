/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Settings, 
  Wand2,
  Sparkles,
  LogOut
} from 'lucide-react';
import { ChatStudio } from './components/ChatStudio';
import { ImageStudio } from './components/ImageStudio';
import { AudioStudio } from './components/AudioStudio';
import { VideoStudio } from './components/VideoStudio';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

type Tool = 'chat' | 'image' | 'video' | 'audio';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('chat');
  const { user, profile, loading, logout } = useAuth();

  const tools = [
    { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
    { id: 'image', label: 'Image Studio', icon: ImageIcon },
    { id: 'video', label: 'Video Editor', icon: Video },
    { id: 'audio', label: 'Audio & Music', icon: Music },
  ];

  const renderTool = () => {
    switch (activeTool) {
      case 'chat': return <ChatStudio />;
      case 'image': return <ImageStudio />;
      case 'video': return <VideoStudio />;
      case 'audio': return <AudioStudio />;
      default: return <ChatStudio />;
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#050505] text-white">Loading...</div>;
  }

  if (!user || !profile?.preferredLanguage) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden text-[#F5F5F5] font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-transparent border-r border-white/10 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
          </div>
          <span className="font-display font-light text-xl tracking-tight">Omni<span className="font-serif italic opacity-70">AI</span></span>
        </div>
        
        <div className="px-4 pb-4">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 px-2">Studios</p>
          <nav className="flex flex-col gap-1">
            {tools.map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as Tool)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group ${
                    isActive ? 'text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 z-10" />
                  <span className="z-10">{tool.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4border-t border-white/5 p-4 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 w-full">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-white/40 hover:text-red-400 hover:bg-white/5 w-full">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 w-full h-full p-4 md:p-6"
          >
            <div className="w-full h-full rounded-2xl bg-[#111] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
              {renderTool()}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
