import React, { useState } from 'react';
import { CompanyData } from '../types';
import { Save, AlertTriangle, Zap, FileJson, Image as ImageIcon, Music } from 'lucide-react';
import { embedContent } from '../services/gemini';

interface KnowledgeBaseProps {
  data: CompanyData;
  onSave: (newData: CompanyData) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ data, onSave }) => {
  const [context, setContext] = useState(data.context);
  const [name, setName] = useState(data.name);
  const [isSaved, setIsSaved] = useState(false);
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [embeddingResult, setEmbeddingResult] = useState<string | null>(null);

  const handleSave = () => {
    onSave({
      name,
      context,
      lastUpdated: Date.now()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const testMultimodalEmbedding = async () => {
    setIsEmbedding(true);
    setEmbeddingResult(null);
    try {
      // Mocking the multimodal embedding from the user's request
      // In a real scenario, these would be actual file buffers/base64
      const result = await embedContent([
        "What is the meaning of life?",
        {
          inlineData: {
            data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", // 1x1 transparent pixel
            mimeType: "image/png"
          }
        }
      ]);
      
      setEmbeddingResult(`Success! Generated ${result.length} embeddings. First vector size: ${result[0].length}`);
    } catch (error: any) {
      setEmbeddingResult(`Error: ${error.message}`);
    } finally {
      setIsEmbedding(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-white mb-2">Native Data Configuration</h1>
        <p className="text-gemini-textSecondary">
          Define the "brain" of Dealr. This data is used for Vector RAG retrieval using Gemini Embeddings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Main Config */}
        <div className="bg-[#1E1F20] rounded-xl border border-[#444746] p-6 space-y-6">
          {/* Name Input */}
          <div>
              <label className="block text-sm font-medium text-gemini-textSecondary mb-2">Workspace Name</label>
              <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#131314] border border-[#444746] rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="e.g. Acme Corp Internal"
              />
          </div>

          {/* Context Input */}
          <div>
               <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gemini-textSecondary">Company Context / System Instructions</label>
                  <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded flex items-center gap-1">
                    <Zap size={10} /> Vector Search Enabled
                  </span>
               </div>
              <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full h-64 bg-[#131314] border border-[#444746] rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors font-mono text-sm leading-relaxed"
                  placeholder="Paste your company policies, data snippets, or specific instructions here..."
              />
               <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                  <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-200/80">
                      This data is now indexed using Gemini-Embedding-2-Preview for hyper-accurate semantic retrieval.
                  </p>
               </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end pt-2">
              <button
                  onClick={handleSave}
                  className={`
                      flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-200
                      ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-300 text-black hover:bg-blue-200'}
                  `}
              >
                  <Save size={18} />
                  {isSaved ? 'Saved!' : 'Save Configuration'}
              </button>
          </div>
        </div>

        {/* New Multimodal RAG Feature Demo */}
        <div className="bg-[#1E1F20] rounded-xl border border-blue-500/30 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <FileJson className="text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Multimodal RAG Feature</h3>
              <p className="text-xs text-gemini-textSecondary">New: Embed text, images, and audio into a single vector space.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#131314] p-3 rounded-lg border border-[#444746] flex flex-col items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-[10px] text-gemini-textSecondary uppercase font-bold">Text</span>
            </div>
            <div className="bg-[#131314] p-3 rounded-lg border border-[#444746] flex flex-col items-center gap-2">
              <ImageIcon size={16} className="text-green-400" />
              <span className="text-[10px] text-gemini-textSecondary uppercase font-bold">Image</span>
            </div>
            <div className="bg-[#131314] p-3 rounded-lg border border-[#444746] flex flex-col items-center gap-2">
              <Music size={16} className="text-purple-400" />
              <span className="text-[10px] text-gemini-textSecondary uppercase font-bold">Audio</span>
            </div>
          </div>

          <button
            onClick={testMultimodalEmbedding}
            disabled={isEmbedding}
            className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {isEmbedding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
            ) : (
              <>
                <Zap size={16} />
                Test Multimodal Embedding (Gemini-Embedding-2)
              </>
            )}
          </button>

          {embeddingResult && (
            <div className="p-3 bg-black/40 rounded-lg border border-[#444746] font-mono text-[10px] text-blue-300 break-all">
              {embeddingResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
