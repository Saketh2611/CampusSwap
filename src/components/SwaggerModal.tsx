import React, { useState, useEffect } from 'react';
import { X, Code2, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SwaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwaggerModal: React.FC<SwaggerModalProps> = ({ isOpen, onClose }) => {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
      const loadSpec = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/docs.json');
          const data = await res.json();
          setSpec(data);
        } catch (err) {
          console.error('Failed to load Swagger spec:', err);
        } finally {
          setLoading(false);
        }
      };
      loadSpec();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const paths = spec?.paths || {};
  const endpoints: { path: string; method: string; summary: string; tags: string[] }[] = [];

  Object.entries(paths).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, def]: [string, any]) => {
      endpoints.push({
        path,
        method: method.toUpperCase(),
        summary: def.summary || '',
        tags: def.tags || ['General'],
      });
    });
  });

  const allTags = ['All', ...Array.from(new Set(endpoints.flatMap((e) => e.tags)))];

  const filteredEndpoints = endpoints.filter(
    (e) => selectedTag === 'All' || e.tags.includes(selectedTag)
  );

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800 border-blue-200',
    POST: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    PUT: 'bg-amber-100 text-amber-800 border-amber-200',
    DELETE: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Swagger / OpenAPI 3.0 API Documentation</h3>
              <p className="text-xs text-slate-400">Node.js Express + Sequelize REST Endpoints</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1 transition"
            >
              <span>Full Swagger UI</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 p-4 border-b border-slate-100 overflow-x-auto bg-slate-50">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading OpenAPI specification...</div>
          ) : (
            <div className="space-y-3">
              {filteredEndpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border shrink-0 ${
                        methodColors[ep.method] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900">/api{ep.path}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{ep.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {ep.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
