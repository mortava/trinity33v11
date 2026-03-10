import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Mic } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  hasStarted?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, hasStarted = false }) => {
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const prompts = [
    "What is the max LTV for a NonQM purchase?",
    "Tell me about DSCR program specifics.",
    "Seasoning for a cash-out refinance?",
    "1099 income for bank statement deals?",
    "Max CLTV for Smart Equity?"
  ];

  const [promptIndex, setPromptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // If session has started or user is focused, stop the typing effect
    if (hasStarted || isFocused) {
      setPlaceholder("Ask Trinity...");
      return;
    }

    const currentPrompt = prompts[promptIndex];
    const typingSpeed = isDeleting ? 20 : 40;
    
    const handleTyping = () => {
      if (!isDeleting && charIndex < currentPrompt.length) {
        setPlaceholder(currentPrompt.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholder(currentPrompt.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else if (!isDeleting && charIndex === currentPrompt.length) {
        setTimeout(() => setIsDeleting(true), 3000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPromptIndex(prev => (prev + 1) % prompts.length);
      }
    };

    const timeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, promptIndex, hasStarted, isFocused]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(52, Math.min(textarea.scrollHeight, 120))}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`
          relative rounded-[40px] bg-white transition-all duration-300
          ${isLoading ? 'opacity-60' : 'focus-within:ring-0'}
        `}
      >
        <div className="flex items-center p-4 sm:p-6 gap-4 min-h-[80px] sm:min-h-[100px]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent placeholder-[#292929]/20 outline-none resize-none py-2 px-4 sm:py-3 sm:px-6 overflow-hidden text-[16px] sm:text-[18px] text-[#292929] leading-relaxed font-normal antialiased"
            style={{ minHeight: '44px' }}
            rows={1}
            disabled={isLoading}
            aria-label="Ask Trinity"
          />

          <div className="flex gap-4 items-center pr-4 sm:pr-8">
             {input.trim().length > 0 ? (
                <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="p-3 sm:p-4 bg-[#0000ff] text-white rounded-2xl transition-all active:scale-90 hover:bg-[#0000cc] shadow-lg shadow-blue-500/20"
                    title="Send message"
                >
                    <ArrowRight size={24} strokeWidth={2.5} />
                </button>
             ) : (
                <button 
                    className="p-2 text-[#292929]/20 hover:text-[#0000ff] transition-colors flex-shrink-0"
                >
                    <Mic size={28} strokeWidth={1.5} />
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;