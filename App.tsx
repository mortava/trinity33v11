import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ExternalLink, ChevronDown, ChevronUp, Triangle, Settings } from 'lucide-react';
import InputArea from './components/InputArea';
import MessageBubble from './components/MessageBubble';
import KnowledgeBase from './components/KnowledgeBase';
import { ChatSession, Message, ViewState } from './types';
import { streamChatResponse } from './services/gemini';
import { IngestionStats, ingestData } from './utils/pipeline';

const generateId = () => Math.random().toString(36).substring(2, 15);

const TrinityLogo = () => (
  <div className="relative w-32 h-32 flex items-center justify-center mb-4 animate-dealr-in">
    {/* Outline Triangle 1 */}
    <div className="absolute transform -translate-x-3 translate-y-1 -rotate-12 opacity-30">
      <Triangle size={64} className="text-[#0000ff]" strokeWidth={1} />
    </div>
    {/* Outline Triangle 2 */}
    <div className="absolute transform translate-x-3 -translate-y-1 rotate-12 opacity-30">
      <Triangle size={64} className="text-[#0000ff]" strokeWidth={1} />
    </div>
    {/* Solid Triangle */}
    <div className="absolute transform z-10 drop-shadow-2xl">
      <Triangle size={56} className="text-[#0000ff] fill-[#0000ff]" strokeWidth={1} />
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const [ingestionStats, setIngestionStats] = useState<IngestionStats>({
    sectionsProcessed: 0,
    totalRules: 0,
    tokensEstimated: 0,
    lastIngested: 0
  });

  useEffect(() => {
    const { stats } = ingestData();
    setIngestionStats(stats);
    
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions([newSession]);
    setCurrentSessionId(newSession.id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isLoading]);

  const handleReset = () => {
    setExpandedTurns({});
    setHeaderOpacity(1);
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Session',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions([newSession]);
    setCurrentSessionId(newSession.id);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newOpacity = Math.max(0, 1 - scrollTop / 80);
    if (newOpacity !== headerOpacity) {
      setHeaderOpacity(newOpacity);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId) return;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, userMsg],
          title: session.messages.length === 0 ? text.slice(0, 30) + '...' : session.title
        };
      }
      return session;
    }));

    setIsLoading(true);
    const botMsgId = generateId();
    const botMsgPlaceholder: Message = {
      id: botMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return { ...session, messages: [...session.messages, botMsgPlaceholder] };
      }
      return session;
    }));

    try {
      const currentSession = sessions.find(s => s.id === currentSessionId);
      const history = currentSession ? [...currentSession.messages, userMsg] : [userMsg];

      await streamChatResponse(
        history,
        text,
        (streamedText) => {
          setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
              const updatedMessages = session.messages.map(msg =>
                msg.id === botMsgId ? { ...msg, content: streamedText } : msg
              );
              return { ...session, messages: updatedMessages };
            }
            return session;
          }));
        }
      );

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          const updatedMessages = session.messages.map(msg =>
            msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
          );
          return { ...session, messages: updatedMessages };
        }
        return session;
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const ActionButtons = () => (
    <div className="flex gap-6 sm:gap-10 justify-center items-center mt-8 mb-6">
      <button
        onClick={handleReset}
        className="group flex items-center gap-2.5 transition-all hover:opacity-100 opacity-40 active:scale-95 bg-transparent border-none p-0"
      >
        <RefreshCw size={18} className="text-[#0000ff] group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-[11px] font-bold text-[#292929]/60 uppercase tracking-[0.2em]">RESET</span>
      </button>

      <button
        onClick={() => window.open('https://pricer.defywholesale.com', '_blank')}
        className="group flex items-center gap-2.5 transition-all hover:opacity-100 opacity-40 active:scale-95 bg-transparent border-none p-0"
      >
        <ExternalLink size={18} className="text-[#292929]/60" />
        <span className="text-[11px] font-bold text-[#292929]/60 uppercase tracking-[0.2em]">QUICK PRICER</span>
      </button>
    </div>
  );

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const isLandingPage = !currentSession || currentSession.messages.length === 0;

  const turns: Message[][] = [];
  if (currentSession) {
    for (let i = 0; i < currentSession.messages.length; i += 2) {
      turns.push(currentSession.messages.slice(i, i + 2));
    }
  }

  const toggleTurn = (idx: number) => {
    setExpandedTurns(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSettingsClick = () => {
    setShowPasscodeModal(true);
    setPasscodeInput('');
    setPasscodeError(false);
  };

  const verifyPasscode = () => {
    if (passcodeInput === '2003') {
      setView('knowledge-base');
      setShowPasscodeModal(false);
    } else {
      setPasscodeError(true);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans selection:bg-[#0000ff]/10 text-[#292929]">
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        
        {view === 'chat' && (
          <header 
            className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-30 transition-opacity duration-300 pointer-events-none"
            style={{ opacity: headerOpacity }}
          >
            <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={handleReset}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors text-[#292929]/40"
                title="New Chat"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </header>
        )}

        {view === 'knowledge-base' && (
          <header className="absolute top-0 left-0 right-0 h-16 flex items-center px-6 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <button 
              onClick={() => setView('chat')}
              className="flex items-center gap-2 text-[11px] font-bold text-[#292929]/40 uppercase tracking-widest hover:text-[#0000ff] transition-colors"
            >
              <ChevronDown className="rotate-90" size={16} />
              Back to Chat
            </button>
          </header>
        )}

        {showPasscodeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm animate-dealr-in">
              <h3 className="text-lg font-bold mb-4 text-center">Enter Passcode</h3>
              <input 
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyPasscode()}
                autoFocus
                className={`w-full bg-gray-50 border ${passcodeError ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 transition-all`}
                placeholder="••••"
              />
              {passcodeError && <p className="text-red-500 text-xs mt-2 text-center">Incorrect passcode</p>}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowPasscodeModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={verifyPasscode}
                  className="flex-1 py-3 bg-[#0000ff] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0000cc] transition-colors shadow-lg shadow-blue-500/20"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'knowledge-base' ? (
          <div className="flex-1 overflow-y-auto pt-16" onScroll={handleScroll}>
            <KnowledgeBase 
              data={{
                name: "Defy TPO Engine",
                context: "Default context...",
                lastUpdated: Date.now()
              }} 
              onSave={() => {}} 
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full relative">
            <div 
              className={`flex-1 ${isLandingPage ? 'overflow-hidden' : 'overflow-y-auto'} custom-scrollbar pt-16`}
              onScroll={handleScroll}
            >
              <div className={`mx-auto px-4 h-full relative transition-all duration-500 ${isLandingPage ? 'max-w-[1000px]' : 'max-w-[800px]'}`}>
                {isLandingPage ? (
                  <div className="flex flex-col items-center justify-center h-full animate-dealr-in pb-12">
                    <TrinityLogo />
                    
                    <h2 className="text-[80px] sm:text-[120px] font-black mb-0 text-[#292929] tracking-tighter leading-none uppercase select-none">
                      TRINITY
                    </h2>
                    <div className="mt-2 mb-16">
                      <p className="text-[10px] sm:text-[14px] font-bold text-[#292929]/30 uppercase tracking-[0.3em] sm:tracking-[0.45em] text-center whitespace-nowrap">
                        DEFY TPO BROKER DEAL DESK
                      </p>
                    </div>

                    <div className="w-full max-w-[750px]">
                      <div className="shadow-[0_40px_80px_rgba(0,0,0,0.06)] rounded-[40px]">
                        <InputArea
                          key={currentSessionId}
                          onSendMessage={handleSendMessage}
                          isLoading={isLoading}
                          hasStarted={false}
                        />
                      </div>
                      <ActionButtons />
                    </div>
                    
                    <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 pointer-events-auto">
                      <div className="flex items-center gap-6">
                        <span className="text-[11px] font-bold text-[#292929]/20 uppercase tracking-[0.5em]">OpenBroker Labs</span>
                        <div className="w-1 h-1 rounded-full bg-[#292929]/10" />
                        <button 
                          onClick={handleSettingsClick}
                          className="flex items-center gap-2 text-[11px] font-bold text-[#292929]/30 uppercase tracking-[0.3em] hover:text-[#0000ff] transition-colors"
                        >
                          <Settings size={14} />
                          <span>Settings</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pb-56 pt-4">
                    {turns.map((turn, idx) => {
                      const isLastTurn = idx === turns.length - 1;
                      const isExpanded = expandedTurns[idx] || isLastTurn;

                      return (
                        <div key={idx} className="mb-4 sm:mb-6">
                          {!isLastTurn && (
                            <button 
                              onClick={() => toggleTurn(idx)}
                              className="w-full flex items-center justify-between px-3 py-1 mb-2 rounded-lg border border-dealr-border bg-dealr-surface text-[8px] sm:text-[9px] font-bold text-dealr-text/30 uppercase tracking-widest transition-all hover:bg-white hover:text-dealr-text/60 shadow-sm"
                            >
                              <span className="truncate">Context: {turn[0]?.content.slice(0, 40)}...</span>
                              {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          )}
                          <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden'}`}>
                            {turn.map((msg) => (
                              <MessageBubble key={msg.id} message={msg} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} className="h-4" />
                  </div>
                )}
              </div>
            </div>

            {!isLandingPage && (
              <div className="absolute bottom-0 left-0 right-0 pt-4 pb-6 sm:pb-8 bg-gradient-to-t from-dealr-bg via-dealr-bg/95 to-transparent z-10 border-t border-dealr-border/20 backdrop-blur-sm">
                <div className="max-w-[700px] mx-auto px-4">
                  <InputArea
                    key={currentSessionId}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    hasStarted={true}
                  />
                  <ActionButtons />
                  <div className="flex items-center justify-center gap-4 mt-4 opacity-30">
                    <span className="text-[9px] font-bold uppercase tracking-widest">OpenBroker Labs</span>
                    <button onClick={handleSettingsClick} className="hover:text-[#0000ff] transition-colors">
                      <Settings size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;