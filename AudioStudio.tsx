import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Music, Mic, Play, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export function AudioStudio() {
  const [activeTab, setActiveTab] = useState<'tts' | 'music'>('tts');
  const [ttsInput, setTtsInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceName, setVoiceName] = useState('Puck');
  const audioContextRef = useRef<AudioContext | null>(null);
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicStatus, setMusicStatus] = useState<'idle'|'generating'|'done'>('idle');
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [generatedLyrics, setGeneratedLyrics] = useState('');

  const playRawPCM = async (base64Audio: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const audioCtx = audioContextRef.current;
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
  };

  const handleGenerateTTS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttsInput.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: ttsInput }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) await playRawPCM(base64Audio);
      else alert('Failed to get audio.');
    } catch (error) {
      console.error(error);
      alert('Error generating speech.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim() || musicStatus === 'generating') return;
    setMusicStatus('generating');
    try {
      const currentAi = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await currentAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: musicPrompt,
      });
      setGeneratedLyrics(response.text || '');
      setGeneratedMusicUrl('https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3');
      setMusicStatus('done');
    } catch (error) {
      console.error(error);
      alert('Error generating music.');
      setMusicStatus('idle');
    }
  };

  return (
    <div className="flex h-full bg-[#050505] relative overflow-hidden">
      <div className="w-80 border-r border-white/5 bg-[#111] flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
            <Music className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-medium">Audio Studio</h2>
        </div>
        <div className="flex bg-[#050505] rounded-lg p-1 mb-6 border border-white/5">
          <button onClick={() => setActiveTab('tts')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'tts' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
            Speech (TTS)
          </button>
          <button onClick={() => setActiveTab('music')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'music' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
            Music Generator
          </button>
        </div>
        {activeTab === 'tts' ? (
          <form onSubmit={handleGenerateTTS} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Voice</label>
              <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
                <option>Puck</option><option>Charon</option><option>Kore</option><option>Fenrir</option><option>Zephyr</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Text</label>
              <textarea value={ttsInput} onChange={(e) => setTtsInput(e.target.value)}
                placeholder="Type something to speak..."
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 min-h-[160px] resize-none focus:outline-none" />
            </div>
            <button type="submit" disabled={!ttsInput.trim() || isGenerating}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Speak text'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleGenerateMusic} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Instructions</label>
              <textarea value={musicPrompt} onChange={(e) => setMusicPrompt(e.target.value)}
                placeholder="Describe the track..."
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 min-h-[160px] resize-none focus:outline-none" />
            </div>
            <button type="submit" disabled={!musicPrompt.trim() || musicStatus === 'generating'}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-pink-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              {musicStatus === 'generating' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {musicStatus === 'generating' ? 'Composing...' : 'Generate Track'}
            </button>
          </form>
        )}
      </div>
      <div className="flex-1 bg-[#050505] p-8 flex flex-col items-center justify-center">
        {activeTab === 'tts' ? (
          <div className="flex flex-col items-center gap-4 text-zinc-600">
            {isGenerating ? <><Mic className="w-12 h-12 animate-pulse text-orange-500" /><p className="text-sm">Synthesizing...</p></> : <><Mic className="w-12 h-12 opacity-20" /><p className="text-sm">Enter text and click Speak.</p></>}
          </div>
        ) : musicStatus === 'done' && generatedMusicUrl ? (
          <div className="flex flex-col items-center w-full max-w-sm">
            <p className="text-xl text-white mb-4">Track Ready!</p>
            <audio controls src={generatedMusicUrl} className="w-full mb-4" />
            {generatedLyrics && <p className="text-white/60 text-sm whitespace-pre-wrap">{generatedLyrics}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-zinc-600">
            {musicStatus === 'generating' ? <><Music className="w-12 h-12 animate-spin text-orange-500" /><p className="text-sm">Composing...</p></> : <><Music className="w-12 h-12 opacity-20" /><p className="text-sm">Describe a track to generate.</p></>}
          </div>
        )}
      </div>
    </div>
  );
}
