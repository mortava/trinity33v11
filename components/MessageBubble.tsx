import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Message } from '../types';
import { Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`flex w-full mb-6 sm:mb-8 ${isUser ? 'justify-end' : 'justify-start animate-dealr-in'}`}>
      <div className={`flex w-full ${isUser ? 'justify-end max-w-full sm:max-w-[85%]' : 'justify-start max-w-full sm:max-w-[85%]'}`}>
        
        {/* Content Container */}
        <div className={`flex flex-col min-w-0 flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="max-w-none text-[13px] sm:text-[14px] leading-[1.6] w-full min-w-0 text-dealr-text">
            {isUser ? (
              <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-[16px] sm:rounded-[20px] rounded-tr-none bg-white border border-dealr-border shadow-sm font-normal">
                {message.content}
              </div>
            ) : (
              <div className="w-full min-w-0 overflow-hidden prose prose-zinc max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    table: ({node, ...props}) => (
                      <div className="my-3 sm:my-4 w-full overflow-hidden rounded-lg sm:rounded-xl border border-dealr-border bg-white shadow-md">
                        <table className="w-full table-fixed border-collapse" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-dealr-surface/50 border-b border-dealr-border" {...props} />,
                    th: ({node, ...props}) => (
                      <th className="px-3 py-1.5 sm:px-4 sm:py-2 text-left text-[9px] sm:text-[10px] font-bold text-dealr-text/60 uppercase tracking-wider break-words" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-[12px] border-t border-dealr-border text-dealr-text align-top break-words" {...props} />
                    ),
                    tr: ({node, ...props}) => <tr className="hover:bg-dealr-accent/5 transition-colors" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 sm:mb-4 last:mb-0 leading-relaxed font-normal text-dealr-text/80" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-dealr-text" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1 ml-4 sm:ml-6 list-disc text-[12px] sm:text-[13px] text-dealr-text/80 font-normal" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {!isUser && !message.isStreaming && message.content && (
            <div className="flex items-center gap-2 mt-1 sm:mt-2 opacity-30 hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-dealr-accent/10 text-dealr-text/20 hover:text-dealr-accent transition-all active:scale-90"
                title="Copy to clipboard"
              >
                {isCopied ? <Check size={14} className="text-dealr-accent" /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;