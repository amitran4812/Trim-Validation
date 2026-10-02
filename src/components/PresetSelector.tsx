import React from 'react';
import { TRIM_PRESETS } from '../utils/presets';
import { TrimPreset } from '../types/trim';
import { X, Sparkles, ArrowRight, Layers } from 'lucide-react';

interface PresetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: TrimPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Preset Trim Test Scenarios
              </h3>
              <p className="text-xs text-slate-500">
                Load predefined register trim sequences from analog &amp; mixed-signal engineering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards list */}
        <div className="p-5 space-y-3 overflow-y-auto">
          {TRIM_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/40 hover:border-blue-300 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {preset.name}
                    </h4>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Reg {preset.addressLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {preset.occurrences} stages
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-xs"
                >
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Steps summary */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-600">
                <span className="text-slate-400 font-medium">Initial: 0x{preset.initialIncoming}</span>
                <span>→</span>
                {preset.rows.map((r, rIdx) => (
                  <span
                    key={rIdx}
                    className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 font-medium"
                  >
                    #{rIdx + 1}: M=0x{r.mask}, V=0x{r.validate}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
