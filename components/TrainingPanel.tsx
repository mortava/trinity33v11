import React, { useState } from 'react';
import { IngestionStats } from '../utils/pipeline';
import { generateLogicFile } from '../utils/tuningGenerator';
import { searchKnowledgeBase, SearchResult } from '../utils/search';
import { BrainCircuit, CheckCircle2, RefreshCw, Server, ShieldCheck, Database, Terminal, Download, Search, FileJson, Activity } from 'lucide-react';

interface TrainingPanelProps {
  stats: IngestionStats;
  onRetrain: () => void;
}

const TrainingPanel: React.FC<TrainingPanelProps> = ({ stats, onRetrain }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnostics'>('overview');
  
  // Diagnostic State
  const [testQuery, setTestQuery] = useState('');
  const [ragResults, setRagResults] = useState<SearchResult[]>([]);
  const [hasRunTest, setHasRunTest] = useState(false);

  const handleRetrain = () => {
    setIsTraining(true);
    setTimeout(() => {
      onRetrain();
      setIsTraining(false);
    }, 1500);
  };

  const handleRunDiagnostics = () => {
    if(!testQuery.trim()) return;
    const results = searchKnowledgeBase(testQuery, 5); // Fetch top 5
    setRagResults(results);
    setHasRunTest(true);
  };

  const handleDownloadLogicFile = () => {
    const logicData = generateLogicFile();
    const blob = new Blob([JSON.stringify(logicData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dealr_logic_v1_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Dealr Core</h1>
            <p className="text-gemini-textSecondary text-lg">
            Manage the SLM inference engine, run retrieval diagnostics, and export logic files.
            </p>
        </div>
        <div className="flex bg-[#1E1F20] p-1 rounded-lg border border-[#444746]">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-[#2D2E2F] text-white shadow-sm' : 'text-gemini-textSecondary hover:text-white'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('diagnostics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'diagnostics' ? 'bg-[#2D2E2F] text-white shadow-sm' : 'text-gemini-textSecondary hover:text-white'}`}
            >
                RAG Diagnostics
            </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stat Card 1 */}
                <div className="bg-[#1E1F20] border border-[#444746] p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4 text-blue-300">
                    <Server size={24} />
                    <h3 className="font-medium">Knowledge Corpus</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.sectionsProcessed}</div>
                <div className="text-sm text-gemini-textSecondary">Active Data Sections</div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-[#1E1F20] border border-[#444746] p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4 text-purple-300">
                    <ShieldCheck size={24} />
                    <h3 className="font-medium">Rule Density</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalRules}</div>
                <div className="text-sm text-gemini-textSecondary">Underwriting Rules Ingested</div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-[#1E1F20] border border-[#444746] p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4 text-green-300">
                    <BrainCircuit size={24} />
                    <h3 className="font-medium">Context Window</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.tokensEstimated.toLocaleString()}</div>
                <div className="text-sm text-gemini-textSecondary">Tokens Utilized</div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pipeline Status */}
                <div className="bg-[#1E1F20] border border-[#444746] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-[#444746]">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                            <Activity size={20} className="text-blue-400" />
                            Ingestion Pipeline
                        </h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Defy_Native_Data.json</div>
                                        <div className="text-sm text-gemini-textSecondary">Updated: {new Date(stats.lastIngested).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full text-xs font-medium">
                                    <CheckCircle2 size={14} />
                                    <span>Active</span>
                                </div>
                            </div>

                            <div className="bg-[#131314] rounded-xl p-4 mb-6 font-mono text-xs text-gemini-textSecondary border border-[#444746]">
                                <div className="flex justify-between mb-2">
                                    <span>STATUS: ONLINE</span>
                                    <span>MODEL: DEALR-SLM-V1</span>
                                </div>
                                <div className="w-full bg-[#444746] h-1 rounded-full overflow-hidden">
                                    <div className="bg-blue-400 h-full w-full"></div>
                                </div>
                                <div className="mt-2 text-blue-300">
                                    {">"} System prompt injected successfully.<br/>
                                    {">"} {stats.totalRules} rules mapped.
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleRetrain}
                            disabled={isTraining}
                            className={`
                                w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200
                                ${isTraining ? 'bg-[#2D2E2F] text-gray-500 cursor-wait' : 'bg-[#E3E3E3] hover:bg-white text-black'}
                            `}
                        >
                            <RefreshCw size={18} className={isTraining ? "animate-spin" : ""} />
                            {isTraining ? 'Re-indexing...' : 'Re-run Pipeline'}
                        </button>
                    </div>
                </div>

                {/* Logic File Export */}
                <div className="bg-[#1E1F20] border border-[#444746] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-[#444746]">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                            <FileJson size={20} className="text-purple-400" />
                            Logic File Generator
                        </h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-gemini-textSecondary text-sm mb-6 leading-relaxed">
                            Generate a structured JSON dataset from your matrices and guidelines. 
                            This file serves as the "Logic File" for fine-tuning external models or auditing internal decision trees.
                        </p>
                        
                        <div className="flex-1 bg-[#131314] rounded-xl border border-[#444746] p-4 mb-6 font-mono text-xs text-gray-400 overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 h-full w-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <span className="text-purple-300">{"{"}</span><br/>
                            &nbsp;&nbsp;<span className="text-blue-300">"meta"</span>: <span className="text-green-300">{"{"}</span><br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"generatedAt"</span>: <span className="text-orange-300">"{new Date().toISOString().slice(0,10)}..."</span><br/>
                            &nbsp;&nbsp;<span className="text-green-300">{"}"}</span>,<br/>
                            &nbsp;&nbsp;<span className="text-blue-300">"examples"</span>: [<br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// {stats.totalRules * 2}+ QA Pairs...</span><br/>
                            &nbsp;&nbsp;]<br/>
                            <span className="text-purple-300">{"}"}</span>
                        </div>

                        <button
                            onClick={handleDownloadLogicFile}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-[#2D2E2F] hover:bg-[#3C3D3E] text-white border border-[#444746] transition-all"
                        >
                            <Download size={18} />
                            Download Logic File
                        </button>
                    </div>
                </div>

            </div>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
            
            {/* Search Input */}
            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunDiagnostics()}
                    className="block w-full pl-12 pr-4 py-4 bg-[#1E1F20] border border-[#444746] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg font-light"
                    placeholder="Enter a test scenario (e.g. 'Max LTV for DSCR loan with 700 score')..."
                />
                <button 
                    onClick={handleRunDiagnostics}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors"
                >
                    Run Test
                </button>
            </div>

            {/* Results Area */}
            <div className="flex-1">
                {!hasRunTest ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gemini-textSecondary border border-dashed border-[#444746] rounded-2xl bg-[#1E1F20]/30">
                        <Terminal size={48} className="mb-4 opacity-50" />
                        <p className="text-sm">Enter a query above to visualize the Retrieval Augmented Generation pipeline.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gemini-textSecondary mb-2">
                            <span>Retrieval Results ({ragResults.length} chunks)</span>
                            <span className="text-xs font-mono bg-[#2D2E2F] px-2 py-1 rounded">Execution: ~12ms</span>
                        </div>

                        {ragResults.length === 0 ? (
                            <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-center">
                                No relevant chunks found. The model would fallback to general knowledge or refuse to answer.
                            </div>
                        ) : (
                            ragResults.map((result, idx) => (
                                <div key={idx} className="bg-[#1E1F20] border border-[#444746] rounded-xl p-5 hover:border-blue-500/50 transition-colors group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                                ${idx === 0 ? 'bg-green-500/20 text-green-400' : 'bg-[#2D2E2F] text-gray-400'}
                                            `}>
                                                #{idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-300">{result.sectionTitle || 'General Knowledge'}</h4>
                                                <div className="text-xs text-gray-500 font-mono">Relevance Score: {result.score}</div>
                                            </div>
                                        </div>
                                        {result.score > 10 && (
                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] uppercase font-bold tracking-wider rounded">High Confidence</span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <p className="text-sm text-[#E3E3E3] font-mono leading-relaxed pl-4 border-l-2 border-[#444746] group-hover:border-blue-500/30 transition-colors">
                                            {result.content.slice(0, 300)}...
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        <div className="mt-8 p-6 bg-[#131314] border border-[#444746] rounded-xl">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <BrainCircuit size={16} className="text-purple-400" />
                                LLM Context Injection Preview
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                The following text block is what Dealr constructs and sends to the model based on the retrieval above.
                            </p>
                            <div className="bg-black/50 p-4 rounded-lg border border-[#2D2E2F] font-mono text-xs text-gray-300 max-h-48 overflow-y-auto custom-scrollbar">
                                <span className="text-purple-400">--- KNOWLEDGE BASE CONTEXT ---</span><br/><br/>
                                {ragResults.map(r => `[SOURCE: ${r.sectionTitle}]\n${r.content.slice(0,150)}...`).join('\n\n')}<br/><br/>
                                <span className="text-purple-400">--- END CONTEXT ---</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPanel;