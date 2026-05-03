import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'model' | 'error';
  content: string;
}

export function ChatStudio() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hello! I'm OmniAI. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const historyParts = messages
        .filter(m => m.id !== '1' && m.role !== 'error')
        .map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      historyParts.push({ role: 'user', parts: [{ text: input }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: historyParts,
        config: {
          systemInstruction: `You are OmniAI. Reply in language: ${profile?.preferredLanguage || 'en'}`
        }
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "No response."
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'error',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] relative">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#111]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-medium">Chat Assistant</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={message.id}
            className={`flex gap-4 max-w-3xl mx-auto ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-white/10' : 'bg-[#111] border border-white/10'}`}>
              {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white/60" />}
            </div>
            <div className={`px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-white/10 text-white rounded-tr-none' : message.role === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-200 rounded-tl-none' : 'bg-[#111] border border-white/10 text-white/80 rounded-tl-none prose prose-invert max-w-none'}`}>
              {message.role === 'user' ? message.content : (
                <div className="text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#111] border border-white/10">
              <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-white/5 bg-[#050505]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask OmniAI anything..."
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none text-white placeholder-white/20"
            />
            <button type="submit" disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 text-white/40 hover:text-white disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <button type="button" onClick={() => alert("Coming soon!")}
            className="p-3 rounded-xl bg-[#111] border border-white/10 text-white/40 hover:text-white">
            <Mic className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
