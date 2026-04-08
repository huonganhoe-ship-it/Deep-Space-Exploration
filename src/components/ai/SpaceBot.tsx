import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, X, Loader2, Sparkles, Globe, Rocket, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askSpaceBot } from '../../services/aiService';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface SpaceBotProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export function SpaceBot({ onClose, isStandalone = false }: SpaceBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "Greetings, Explorer. I am the Solaris Space Bot. Ask me anything about the cosmos, our solar system, or the missions currently in transit.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await askSpaceBot(input);

    const botMessage: Message = {
      role: 'bot',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0a0a] shadow-2xl ${isStandalone ? 'fixed inset-0' : ''}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tighter italic">Space Bot</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Subspace Link Active</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-purple-500/10 border border-purple-500/20 text-white' 
                      : 'bg-white/5 border border-white/10 text-white/80'
                  }`}>
                    <div className="markdown-body prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 items-center bg-white/5 border border-white/10 p-3 rounded-2xl">
              <Loader2 size={14} className="animate-spin text-blue-400" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Querying Star Charts...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {[
            { text: "What is Artemis II?", icon: Rocket },
            { text: "Tell me about Earth", icon: Globe },
            { text: "How far is the Moon?", icon: Star },
            { text: "Space facts", icon: Sparkles }
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(q.text);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-mono text-white/40 hover:text-white transition-all"
            >
              <q.icon size={10} />
              {q.text}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-white/10 bg-black/20">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the cosmos..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20 text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              input.trim() && !isLoading 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'text-white/20'
            }`}
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-[8px] font-mono text-white/10 uppercase tracking-[0.3em] mt-3 text-center">
          AI may provide inaccurate telemetry. Verify with mission control.
        </p>
      </div>
    </div>
  );
}
