import React, { useState } from 'react';
import { ComputedRow } from '../types/trim';
import { Check, Copy, Binary, ArrowRight } from 'lucide-react';

interface FinalResultCardProps {
  pipeline: ComputedRow[];
  addressLabel: string;
}

export const FinalResultCard: React.FC<FinalResultCardProps> = ({
  pipeline,
  addressLabel,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!pipeline.length) return null;

  const finalStage = pipeline[pipeline.length - 1];
  const initialStage = pipeline[0];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const bitProvenance = [];
  for (let b = 7; b >= 0; b--) {
    let lastModStage: number | null = null;
    for (let s = pipeline.length - 1; s >= 0; s--) {
      const bitMask = 1 << b;
      if ((pipeline[s].maskVal & bitMask) !== 0) {
        lastModStage = s + 1;
        break;
      }
    }
    const finalBit = (finalStage.resultVal & (1 << b)) ? 1 : 0;
    bitProvenance.push({
      bitIndex: b,
      finalBit,
      lastModifiedStage: lastModStage,
    });
  }

  const modifiedBitsCount = bitProvenance.filter(b => b.lastModifiedStage !== null).length;
  const untouchedBitsCount = 8 - modifiedBitsCount;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-blue-700 font-bold font-mono">
                Pipeline Validation Complete
              </span>
              <span className="text-xs text-slate-300 font-mono">·</span>
              <span className="text-xs text-slate-500 font-mono font-medium">
                Target: {addressLabel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Final Register Result Value
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accumulated result after chaining {pipeline.length} trim stage{pipeline.length > 1 ? 's' : ''}.
            </p>
          </div>

          {/* Quick Copy Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCopy(`0x${finalStage.resultHexFormatted}`, 'hex')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-mono font-semibold text-slate-700 hover:text-blue-700 transition-colors shadow-xs"
              title="Copy HEX literal"
            >
              {copiedType === 'hex' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy 0x{finalStage.resultHexFormatted}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopy(finalStage.resultBinFormatted, 'bin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-mono font-semibold text-slate-700 hover:text-blue-700 transition-colors shadow-xs"
              title="Copy 8-bit binary string"
            >
              {copiedType === 'bin' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Binary className="w-3.5 h-3.5" />
                  <span>Copy Binary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Big Displays: HEX and BINARY side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
          {/* HEX Result */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs uppercase font-semibold text-slate-500">
              HEX Result (2-Digit)
            </span>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-slate-400 font-mono text-lg font-medium">0x</span>
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-slate-900 tracking-wider">
                {finalStage.resultHexFormatted}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Byte range: 0x00 to 0xFF
            </span>
          </div>

          {/* Binary Result */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs uppercase font-semibold text-slate-500">
              Binary Result (8-Bit)
            </span>
            <div className="flex items-center gap-2 my-2 font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-blue-700">
              <span>{finalStage.resultBinFormatted.slice(0, 4)}</span>
              <span className="text-slate-300 text-base font-normal">·</span>
              <span>{finalStage.resultBinFormatted.slice(4)}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Upper nibble / Lower nibble
            </span>
          </div>

          {/* Decimal Equivalent */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs uppercase font-semibold text-slate-500">
              Decimal Value
            </span>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-slate-900">
                {finalStage.resultVal}
              </span>
              <span className="text-xs text-slate-500 font-mono ml-1.5 font-medium">
                / 255
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Signed (int8): {finalStage.resultVal > 127 ? finalStage.resultVal - 256 : finalStage.resultVal}
            </span>
          </div>

          {/* Pipeline Migration Stats */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs uppercase font-semibold text-slate-500">
              Register Transformation
            </span>
            <div className="flex items-center gap-2 my-2 font-mono text-sm">
              <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold shadow-xs">
                0x{initialStage.incomingHexFormatted}
              </span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span className="px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-extrabold shadow-xs">
                0x{finalStage.resultHexFormatted}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 font-sans">
              {modifiedBitsCount} bits trimmed · {untouchedBitsCount} bits retained
            </span>
          </div>
        </div>

        {/* Bit Provenance Bar: where did each final bit originate? */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bit-by-Bit Origin Matrix
            </h4>
            <span className="text-[11px] text-slate-500">
              Identifies which stage performed the final override for each bit
            </span>
          </div>

          <div className="grid grid-cols-8 gap-2 text-center">
            {bitProvenance.map((b) => (
              <div
                key={b.bitIndex}
                className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <span className="text-[10px] font-mono text-slate-400 font-medium">
                  b[{b.bitIndex}]
                </span>
                <span className="text-lg font-mono font-extrabold text-slate-900">
                  {b.finalBit}
                </span>
                <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded font-semibold ${
                  b.lastModifiedStage !== null
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-sky-50 text-sky-800 border border-sky-200'
                }`}>
                  {b.lastModifiedStage !== null ? `Stage #${b.lastModifiedStage}` : 'Initial'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
