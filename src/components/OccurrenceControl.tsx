import React from 'react';
import { Minus, Plus, Hash, Layers } from 'lucide-react';

interface OccurrenceControlProps {
  occurrences: number;
  onOccurrencesChange: (count: number) => void;
  addressLabel: string;
  onAddressLabelChange: (label: string) => void;
}

export const OccurrenceControl: React.FC<OccurrenceControlProps> = ({
  occurrences,
  onOccurrencesChange,
  addressLabel,
  onAddressLabelChange,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onOccurrencesChange(Math.max(1, Math.min(10, val)));
    }
  };

  const handleIncrement = () => {
    if (occurrences < 10) onOccurrencesChange(occurrences + 1);
  };

  const handleDecrement = () => {
    if (occurrences > 1) onOccurrencesChange(occurrences - 1);
  };

  const quickCounts = [1, 2, 3, 4, 5, 8, 10];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Address details */}
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Target Address / Register ID
          </label>
          <div className="relative max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
              <Hash className="w-4 h-4 text-blue-500" />
            </span>
            <input
              type="text"
              value={addressLabel}
              onChange={(e) => onAddressLabelChange(e.target.value)}
              placeholder="e.g. 0x3A or REG_TRIM_CTRL"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono font-medium focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Address register where sequential trim mask operations are applied.
          </p>
        </div>

        {/* Center / Right: Number of Occurrences (1 - 10) */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Occurrences / Trim Stages (1 – 10)</span>
            </label>
            <span className="text-xs text-slate-500">
              Generates <span className="font-bold text-blue-700 font-mono">{occurrences}</span> row{occurrences > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Stepper + direct input */}
            <div className="inline-flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden p-0.5 shadow-xs">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={occurrences <= 1}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
                title="Decrease occurrence count"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="number"
                min={1}
                max={10}
                value={occurrences}
                onChange={handleInputChange}
                className="w-12 text-center bg-transparent text-sm font-bold font-mono text-slate-900 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleIncrement}
                disabled={occurrences >= 10}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
                title="Increase occurrence count"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick preset selector buttons */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-lg">
              {quickCounts.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onOccurrencesChange(num)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                    occurrences === num
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Row 1 receives the initial Incoming Value. Rows 2–{occurrences} chain the previous stage's Result Value.
          </p>
        </div>
      </div>
    </div>
  );
};
