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
    { id: '1', role: 'model', content: "Hello! I'm OmniAI. I can help you write, code, edit photos, and generate media. What would you like to do today?" }
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const historyParts = messages
        .filter(m => m.id !== '1' && m.role !== 'error') // Remove initial greeting and errors for context
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));
      
      historyParts.push({ role: 'user', parts: [{ text: input }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: historyParts,
        config: {
          systemInstruction: `You are OmniAI. The user's preferred language code is: ${profile?.preferredLanguage || 'en'}. You MUST reply in their preferred language. If their language is ur, pa, skr or ar, use the native language script.`
        }
      });

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "I couldn't generate a response."
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'error',
        content: `Error: ${error.message || 'Something went wrong.'}`
      };
      setMessages(prev => [...prev, errorMessage]);
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-white/10' : 'bg-[#111] border border-white/10'
            }`}>
              {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white/60" />}
            </div>
            
            <div className={`px-4 py-3 rounded-2xl ${
              message.role === 'user' 
                ? 'bg-white/10 text-white rounded-tr-none' 
                : message.role === 'error'
                  ? 'bg-red-500/20 border border-red-500/30 text-red-200 rounded-tl-none prose prose-invert max-w-none'
                  : 'bg-[#111] border border-white/10 text-white/80 rounded-tl-none prose prose-invert max-w-none'
            }`}>
              {message.role === 'user' ? (
                message.content
              ) : (
                <div className="markdown-body text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 max-w-3xl mx-auto"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#111] border border-white/10">
              <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-[#050505]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask OmniAI anything..."
              className="relative w-full bg-[#111] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-0 text-white placeholder-white/20 transition-all shadow-2xl"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 z-10 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <button
              type="button"
              onClick={() => alert("Recording feature is coming soon! (Mocked for Video Demo)")}
              title="Record audio message"
              className="p-3 rounded-xl bg-[#111] border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors shadow-2xl relative z-10"
            >
              <Mic className="w-5 h-5 flex-shrink-0" />
          </button>
        </form>
      </div>
    </div>
  );
}
