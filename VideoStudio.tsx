import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Film, Wand2, Scissors, Download, Upload, Loader2, Play } from 'lucide-react';

export function VideoStudio() {
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'processing') return;
    setStatus('processing');
    
    // Simulate generation/processing
    setTimeout(() => {
      setStatus('done');
    }, 1500);
  };

  return (
    <div className="flex h-full bg-[#050505] relative overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-80 border-r border-white/5 bg-[#111] flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
            <Video className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-medium">Video Studio</h2>
        </div>

        <div className="flex bg-[#050505] rounded-lg p-1 mb-6 border border-white/5">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium rounded-md transition-colors ${activeTab === 'create' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}
          >
            <Film className="w-4 h-4 mb-1" />
            Create
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium rounded-md transition-colors ${activeTab === 'edit' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}
          >
            <Scissors className="w-4 h-4 mb-1" />
            Edit & Enhance
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleProcess} className="flex flex-col gap-4">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl mb-2 text-[11px] text-teal-200/70">
               Note: Veo 3.1 video generation is currently restricted without manual API key entry. A simulated output will be shown.
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Director Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a cinematic scene in detail..."
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-0 text-white placeholder-white/20 min-h-[160px] resize-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={!prompt.trim() || status === 'processing'}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {status === 'processing' ? 'Generating Video...' : 'Generate Scene'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleProcess} className="flex flex-col gap-4">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl mb-2 text-[11px] text-teal-200/70">
               Note: Full video rendering is mocked for this preview demo. 
            </div>
            <button
              type="button"
              className="w-full py-6 bg-[#050505] hover:bg-[#111] border border-dashed border-white/20 text-white/40 hover:text-white rounded-xl text-sm font-medium transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5 opacity-50" />
              Upload Source Video
            </button>
            
            <div className="space-y-4 mt-2">
                 <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">AI Enhancements</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-zinc-300 p-2 rounded-lg bg-white/5 border border-white/5">
                        <input type="checkbox" className="accent-teal-500 h-4 w-4" defaultChecked />
                        Upscale to 4K
                      </label>
                      <label className="flex items-center gap-2 text-sm text-zinc-300 p-2 rounded-lg bg-white/5 border border-white/5">
                        <input type="checkbox" className="accent-teal-500 h-4 w-4" defaultChecked />
                        Remove Background
                      </label>
                      <label className="flex items-center gap-2 text-sm text-zinc-300 p-2 rounded-lg bg-white/5 border border-white/5">
                        <input type="checkbox" className="accent-teal-500 h-4 w-4" />
                        Color Grade (Cinematic)
                      </label>
                    </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={status === 'processing'}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {status === 'processing' ? 'Processing...' : 'Enhance Video'}
            </button>
          </form>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-[#050505] p-6 flex flex-col items-center justify-center overflow-auto relative">
        <div className="w-full max-w-4xl aspect-video rounded-2xl border border-white/10 bg-[#111] flex shadow-2xl relative overflow-hidden flex-col items-center justify-center">
            {status === 'processing' ? (
                <div className="flex flex-col items-center justify-center text-zinc-400">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                    <p className="font-display text-lg">AI Video Model Processing</p>
                    <p className="text-sm opacity-60">Rendering frames...</p>
                </div>
            ) : status === 'done' ? (
                <>
                    <img 
                      src="https://images.unsplash.com/photo-1682687982501-1e58f81048a6?auto=format&fit=crop&q=80&w=2070" 
                      alt="Generated Video Frame Placeholder" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group cursor-pointer transition-colors hover:bg-black/30">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 ml-1" />
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button 
                           onClick={async () => {
                              const imgUrl = "https://images.unsplash.com/photo-1682687982501-1e58f81048a6?auto=format&fit=crop&q=80&w=2070";
                              if (navigator.share) {
                                try {
                                    await navigator.share({
                                       title: 'My Video',
                                       url: imgUrl
                                    });
                                } catch (e) {
                                  console.error(e);
                                }
                              } else {
                                alert("Share not supported");
                              }
                           }}
                           className="px-4 py-2 bg-[#111] text-white text-sm font-medium opacity-90 hover:opacity-100 rounded-lg shadow cursor-pointer transition-opacity border border-white/20 flex items-center gap-2"
                        >
                            Share
                        </button>
                        <button 
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = "https://images.unsplash.com/photo-1682687982501-1e58f81048a6?auto=format&fit=crop&q=80&w=2070";
                            a.download = "video_placeholder.mp4";
                            a.click();
                          }}
                          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium opacity-90 hover:opacity-100 rounded-lg shadow cursor-pointer transition-opacity border border-teal-500/50 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Download
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500 opacity-50">
                    <Video className="w-16 h-16 mb-4" />
                    <p>Select an operation to preview video output.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
