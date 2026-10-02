import React from 'react';
import { Cpu, RotateCcw, Download, Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenPresets: () => void;
  onOpenExport: () => void;
  onToggleHelp: () => void;
  showHelp: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onOpenPresets,
  onOpenExport,
  onToggleHelp,
  showHelp,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Manual Trim Validation
                </h1>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  8-Bit Register Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Bitwise mask multiplexing: <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-semibold">Mask=0 → Pass Incoming</code>,{' '}
                <code className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-mono font-semibold">Mask=1 → Pass Validate</code>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onToggleHelp}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showHelp
                  ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="Show hardware trim guide and formula"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Logic Guide</span>
            </button>

            <button
              onClick={onOpenPresets}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
              title="Load standard register trim presets"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Presets</span>
            </button>

            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
              title="Export C Code, CSV or JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export</span>
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors shadow-xs"
              title="Reset all values to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
