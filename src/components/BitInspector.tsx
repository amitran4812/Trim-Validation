import React, { useState } from 'react';
import { ComputedRow } from '../types/trim';
import { toggleBit, toHexByte } from '../utils/bitwise';
import { Cpu, ArrowDown, Shuffle, Info } from 'lucide-react';

interface BitInspectorProps {
  stage: ComputedRow;
  stageIndex: number;
  totalStages: number;
  onUpdateMask: (index: number, hex: string) => void;
  onUpdateValidate: (index: number, hex: string) => void;
  onUpdateFirstIncoming?: (hex: string) => void;
}

export const BitInspector: React.FC<BitInspectorProps> = ({
  stage,
  stageIndex,
  onUpdateMask,
  onUpdateValidate,
  onUpdateFirstIncoming,
}) => {
  const [activeBitIndex, setActiveBitIndex] = useState<number | null>(null);

  const handleToggleMaskBit = (bitPos: number) => {
    const newMask = toggleBit(stage.maskVal, bitPos);
    onUpdateMask(stageIndex, toHexByte(newMask));
  };

  const handleToggleValidateBit = (bitPos: number) => {
    const newValidate = toggleBit(stage.validateVal, bitPos);
    onUpdateValidate(stageIndex, toHexByte(newValidate));
  };

  const handleToggleIncomingBit = (bitPos: number) => {
    if (stage.isFirstRow && onUpdateFirstIncoming) {
      const newInc = toggleBit(stage.incomingVal, bitPos);
      onUpdateFirstIncoming(toHexByte(newInc));
    }
  };

  const focusedBit = activeBitIndex !== null
    ? stage.bitBreakdown.find((b) => b.bitIndex === activeBitIndex)
    : null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              Bitwise Multiplexer Circuit Inspector &mdash; Stage #{stageIndex + 1}
            </h3>
            <p className="text-xs text-slate-500">
              Interactive 8-bit trim breakdown: Bit 7 (MSB) down to Bit 0 (LSB)
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
            Incoming: <span className="text-sky-700 font-bold">0x{stage.incomingHexFormatted}</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
            Mask: <span className="text-amber-700 font-bold">0x{stage.maskHexFormatted}</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
            Result: <span className="text-blue-700 font-bold">0x{stage.resultHexFormatted}</span>
          </div>
        </div>
      </div>

      {/* Bit Matrix Grid */}
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Bit Positions [7..0] Header */}
          <div className="grid grid-cols-[140px_repeat(8,1fr)] gap-2 mb-2 items-center text-center">
            <div className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bit Position
            </div>
            {stage.bitBreakdown.map((b) => (
              <div
                key={b.bitIndex}
                className={`py-1 text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors ${
                  activeBitIndex === b.bitIndex
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
                }`}
                onClick={() => setActiveBitIndex(activeBitIndex === b.bitIndex ? null : b.bitIndex)}
                title={`Click to focus Bit ${b.bitIndex}`}
              >
                b[{b.bitIndex}]
                <span className={`block text-[9px] font-normal ${activeBitIndex === b.bitIndex ? 'text-blue-100' : 'text-slate-400'}`}>
                  {b.bitIndex === 7 ? 'MSB' : b.bitIndex === 0 ? 'LSB' : `2^${b.bitIndex}`}
                </span>
              </div>
            ))}
          </div>

          {/* Row 1: Incoming Bits */}
          <div className="grid grid-cols-[140px_repeat(8,1fr)] gap-2 mb-2 items-center text-center">
            <div className="text-left text-xs text-slate-700 flex flex-col justify-center">
              <span className="font-bold text-sky-800">Incoming Bits</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {stage.isFirstRow ? '(editable)' : `(from #${stageIndex})`}
              </span>
            </div>
            {stage.bitBreakdown.map((b) => (
              <button
                key={`inc-${b.bitIndex}`}
                type="button"
                disabled={!stage.isFirstRow}
                onClick={() => handleToggleIncomingBit(b.bitIndex)}
                title={stage.isFirstRow ? `Click to toggle Incoming bit ${b.bitIndex}` : `Inherited from stage #${stageIndex}`}
                className={`h-11 font-mono text-sm font-bold rounded-lg border transition-all flex flex-col items-center justify-center ${
                  stage.isFirstRow ? 'cursor-pointer hover:border-sky-500 hover:shadow-xs' : 'cursor-default'
                } ${
                  b.incomingBit === 1
                    ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <span>{b.incomingBit}</span>
                <span className="text-[9px] font-normal opacity-75">
                  {b.incomingBit ? 'HIGH' : 'LOW'}
                </span>
              </button>
            ))}
          </div>

          {/* Row 2: Mask Bits */}
          <div className="grid grid-cols-[140px_repeat(8,1fr)] gap-2 mb-2 items-center text-center">
            <div className="text-left text-xs text-slate-700 flex flex-col justify-center">
              <span className="font-bold text-amber-800">Mask Bits</span>
              <span className="text-[10px] text-slate-400 font-mono">(click to toggle)</span>
            </div>
            {stage.bitBreakdown.map((b) => (
              <button
                key={`mask-${b.bitIndex}`}
                type="button"
                onClick={() => handleToggleMaskBit(b.bitIndex)}
                title={`Click to toggle Mask bit ${b.bitIndex}: currently ${b.maskBit === 1 ? '1 (TRIM)' : '0 (PASS)'}`}
                className={`h-11 font-mono text-sm font-bold rounded-lg border cursor-pointer transition-all flex flex-col items-center justify-center hover:scale-[1.02] ${
                  b.maskBit === 1
                    ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{b.maskBit}</span>
                <span className="text-[9px] font-normal tracking-tighter">
                  {b.maskBit === 1 ? 'TRIM (1)' : 'PASS (0)'}
                </span>
              </button>
            ))}
          </div>

          {/* Row 3: Validate Bits */}
          <div className="grid grid-cols-[140px_repeat(8,1fr)] gap-2 mb-2 items-center text-center">
            <div className="text-left text-xs text-slate-700 flex flex-col justify-center">
              <span className="font-bold text-emerald-800">Validate Bits</span>
              <span className="text-[10px] text-slate-400 font-mono">(click to toggle)</span>
            </div>
            {stage.bitBreakdown.map((b) => (
              <button
                key={`val-${b.bitIndex}`}
                type="button"
                onClick={() => handleToggleValidateBit(b.bitIndex)}
                title={`Click to toggle Validate bit ${b.bitIndex}`}
                className={`h-11 font-mono text-sm font-bold rounded-lg border cursor-pointer transition-all flex flex-col items-center justify-center hover:scale-[1.02] ${
                  b.validateBit === 1
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{b.validateBit}</span>
                <span className="text-[9px] font-normal opacity-75">
                  {b.validateBit ? 'HIGH' : 'LOW'}
                </span>
              </button>
            ))}
          </div>

          {/* Multiplexer Selector Indicator Bar */}
          <div className="grid grid-cols-[140px_repeat(8,1fr)] gap-2 my-2.5 items-center text-center">
            <div className="text-left text-xs font-mono text-slate-500 flex items-center gap-1">
              <Shuffle className="w-3.5 h-3.5 text-blue-600" />
              <span>MUX Selection</span>
            </div>
            {stage.bitBreakdown.map((b) => (
              <div
                key={`mux-${b.bitIndex}`}
                className={`py-1 text-[10px] font-mono font-medium rounded-md border flex items-center justify-center gap-1 ${
                  b.source === 'validate'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}
              >
                <ArrowDown className="w-3 h-3" />
                <span>{b.source === 'validate' ? 'VAL' : 'INC'}</span>
              </div>
            ))}
          </div>

          {/* Row 4: Result Bits */}
          <div className="grid grid-cols-[140px_repeat(8,1fr)] gap-2 mb-2 items-center text-center">
            <div className="text-left text-xs text-slate-900 flex flex-col justify-center">
              <span className="font-bold text-slate-900 uppercase tracking-wider">Result Bits</span>
              <span className="text-[10px] text-blue-700 font-mono font-bold">0x{stage.resultHexFormatted}</span>
            </div>
            {stage.bitBreakdown.map((b) => (
              <div
                key={`res-${b.bitIndex}`}
                className={`h-12 font-mono text-base font-extrabold rounded-lg border flex flex-col items-center justify-center shadow-xs ${
                  b.source === 'validate'
                    ? 'bg-amber-100 text-amber-900 border-amber-400'
                    : 'bg-blue-100 text-blue-900 border-blue-400'
                }`}
              >
                <span>{b.resultBit}</span>
                <span className="text-[9px] font-medium uppercase tracking-wider text-slate-600">
                  from {b.source === 'validate' ? 'VAL' : 'INC'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Bit Explanation Box */}
      <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
        {focusedBit ? (
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">
                Detailed Analysis of Bit {focusedBit.bitIndex} (Weight 2^{focusedBit.bitIndex} = {1 << focusedBit.bitIndex}):
              </span>{' '}
              Incoming bit is <span className="font-mono text-sky-800 font-bold">{focusedBit.incomingBit}</span>.{' '}
              Mask bit is <span className="font-mono text-amber-800 font-bold">{focusedBit.maskBit}</span>.{' '}
              Validate bit is <span className="font-mono text-emerald-800 font-bold">{focusedBit.validateBit}</span>.
              <div className="mt-1 text-slate-600">
                {focusedBit.maskBit === 0 ? (
                  <span>
                    Because <code className="font-mono text-sky-800 font-semibold">Mask[{focusedBit.bitIndex}] == 0</code>, the incoming bit{' '}
                    <span className="font-mono font-bold text-sky-800">({focusedBit.incomingBit})</span> was passed directly into the Result.
                  </span>
                ) : (
                  <span>
                    Because <code className="font-mono text-amber-800 font-semibold">Mask[{focusedBit.bitIndex}] == 1</code>, the validate bit{' '}
                    <span className="font-mono font-bold text-amber-800">({focusedBit.validateBit})</span> replaced the incoming bit in the Result.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Click any bit position (b[7]..b[0]) above for a dedicated multiplexer trace explanation, or click Mask/Validate bits to toggle them.</span>
            </span>
            <span className="font-mono text-xs text-blue-700 font-semibold">
              Formula: (Incoming &amp; ~Mask) | (Validate &amp; Mask)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
