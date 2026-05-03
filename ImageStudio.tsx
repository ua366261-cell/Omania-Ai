import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ImageIcon, Wand2, Download, Upload, Loader2, Sparkles, SlidersHorizontal, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  
  // For editing
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await currentAi.models.generateContent({
        model: 'imagen-3.0-generate-002',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          // Do not pass imageSize as it is not supported in 2.5
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          setGeneratedImage(`data:${mimeType};base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setActiveTab('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-full bg-[#050505] relative overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-80 border-r border-white/5 bg-[#111] flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-medium">Image Studio</h2>
        </div>

        <div className="flex bg-[#050505] rounded-lg p-1 mb-6 border border-white/5">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'generate' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'edit' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}
          >
            Edit & Retouch
          </button>
        </div>

        {activeTab === 'generate' ? (
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-0 text-white placeholder-white/20 min-h-[120px] resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="w-full py-3 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/10 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>

            {uploadedImage && (
              <div className="space-y-4 mt-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Filters & Adjustments</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-zinc-300 p-2 rounded-lg bg-white/5 border border-white/5">
                        <input type="checkbox" className="accent-pink-500 h-4 w-4" defaultChecked />
                        <span className="flex-1">Remove Background</span>
                        <Wand2 className="w-4 h-4 text-pink-500 opacity-50" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-zinc-500"><span>Brightness</span><span>0</span></div>
                        <input type="range" className="w-full accent-pink-500" disabled />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-zinc-500"><span>Contrast</span><span>0</span></div>
                        <input type="range" className="w-full accent-pink-500" disabled />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-zinc-500"><span>Saturation</span><span>0</span></div>
                        <input type="range" className="w-full accent-pink-500" disabled />
                      </div>
                    </div>
                </div>
                <button
                  className="w-full py-3 bg-white/5 disabled:opacity-50 text-white/40 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4 cursor-not-allowed"
                >
                  <Wand2 className="w-4 h-4" />
                  Auto Enhance (Demo)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-[#050505] p-8 flex flex-col items-center justify-center overflow-auto relative">
        {(activeTab === 'generate' ? generatedImage : uploadedImage) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group rounded-xl overflow-hidden border border-white/10 shadow-2xl max-w-full"
          >
            <img 
              src={(activeTab === 'generate' ? generatedImage : uploadedImage) as string} 
              alt="Workspace" 
              className="max-h-[70vh] object-contain rounded-xl"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <a 
                href={(activeTab === 'generate' ? generatedImage : uploadedImage) as string}
                download="omni-image.png"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 flex items-center justify-center text-white transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
              <button 
                onClick={async () => {
                   const imgDataUrl = (activeTab === 'generate' ? generatedImage : uploadedImage) as string;
                   if (navigator.share) {
                     try {
                        const response = await fetch(imgDataUrl);
                        const blob = await response.blob();
                        const file = new File([blob], 'omni-image.png', { type: blob.type });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                           await navigator.share({
                              title: 'Generated Image',
                              files: [file]
                           });
                        } else {
                           await navigator.share({
                              title: 'Generated Image',
                              url: imgDataUrl
                           });
                        }
                     } catch (e) { console.error(e) }
                   } else {
                     alert("Share not supported");
                   }
                }}
                className="w-12 h-12 rounded-full justify-center bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 flex items-center text-white transition-colors text-sm"
                title="Share"
              >
                Share
              </button>
              {activeTab === 'edit' && (
                 <button 
                  onClick={() => setUploadedImage(null)}
                  className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/40 backdrop-blur border border-red-500/20 flex items-center justify-center text-red-500 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600 gap-4 mb-10 w-full max-w-md aspect-square border-2 border-dashed border-white/5 rounded-3xl">
            {isLoading ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
                <p className="text-sm">Creating your masterpiece...</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p className="text-sm text-center px-8">
                  {activeTab === 'generate' ? 'Enter a prompt and click generate to create an image.' : 'Upload an image to start editing.'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
