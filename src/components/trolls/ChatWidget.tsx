import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOT_RESPONSES = [
  { triggers: ['hello', 'hi', 'hey'], responses: ['Hello! How can I help you today? 😊', 'Welcome to NEXUS support! What can I do for you?'] },
  { triggers: ['help', 'support', 'issue', 'problem'], responses: [
    'I understand you need help. Have you tried turning it off and on again?',
    'Sorry to hear that! Our team is looking into it. ETA: ∞ minutes.',
    'That sounds frustrating. Unfortunately, I\'m a fake chatbot. 🤖',
  ]},
  { triggers: ['price', 'cost', 'billing', 'pay'], responses: [
    'Our pricing is very competitive! Just check our pricing page... if you can find it.',
    'The price was $29/month when this conversation started. It may have changed since then.',
  ]},
  { triggers: ['cancel', 'unsubscribe'], responses: [
    'I\'m sorry you want to leave! To cancel, please fax us a handwritten letter.',
    'Cancel? I don\'t understand that word. Did you mean "celebrate"?',
  ]},
  { triggers: ['bug', 'broken', 'fix', 'error'], responses: [
    'That\'s not a bug, it\'s a ✨feature✨',
    'Have you tried clearing your expectations?',
    'I just checked and everything looks fine on our end. The problem is definitely you.',
  ]},
];

const FALLBACK_RESPONSES = [
  'Interesting! Tell me more. (I\'m not listening.)',
  'I see. Let me transfer you to... oh wait, there\'s nobody else here.',
  'Great question! The answer is definitely yes. Or no. One of those.',
  'Our AI is processing your request... [this will take 3-5 business days]',
  'I didn\'t quite catch that. Could you try typing it backwards?',
  'Hmm, that\'s above my pay grade. I make $0/hour.',
  '🤔 *pretends to type*',
  'Sorry, I got distracted. What were you saying?',
];

interface ChatWidgetProps {
  visible: boolean;
}

export default function ChatWidget({ visible }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fallbackIdx = useRef(0);

  // Auto-open with greeting after delay
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setMessages([{ text: 'Hi there! 👋 Need help with anything?', isUser: false }]);
      setUnread(1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBotResponse = (userMsg: string): string => {
    const lower = userMsg.toLowerCase();
    for (const entry of BOT_RESPONSES) {
      if (entry.triggers.some(t => lower.includes(t))) {
        return entry.responses[Math.floor(Math.random() * entry.responses.length)];
      }
    }
    const resp = FALLBACK_RESPONSES[fallbackIdx.current % FALLBACK_RESPONSES.length];
    fallbackIdx.current++;
    return resp;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);

    // Fake typing delay
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { text: getBotResponse(userMsg), isUser: false }]);
    }, 1000 + Math.random() * 2000);
  };

  if (!visible) return null;

  return (
    <>
      {/* Chat bubble */}
      {!isOpen && (
        <motion.button
          className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center"
          style={{ zIndex: 80 }}
          onClick={() => { setIsOpen(true); setUnread(0); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <span className="text-xl">💬</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-5 w-80 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              zIndex: 80,
              background: 'rgba(15,15,15,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-medium">NEXUS Support</p>
                  <p className="text-white/30 text-[10px]">Usually replies instantly</p>
                </div>
              </div>
              <button
                className="text-white/30 hover:text-white/60 transition-colors text-lg"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.isUser
                        ? 'bg-white text-black rounded-br-md'
                        : 'bg-white/8 text-white/60 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/8 px-3 py-2 rounded-2xl rounded-bl-md flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/30"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              className="px-4 py-3 border-t border-white/5 flex gap-2"
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-xs text-white/70 outline-none placeholder:text-white/20"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-white/10 rounded-lg text-xs text-white/50 hover:bg-white/15 transition-colors"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
