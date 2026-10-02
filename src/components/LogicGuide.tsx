import React from 'react';
import { X, BookOpen, CheckCircle2, Cpu } from 'lucide-react';

interface LogicGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogicGuide: React.FC<LogicGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Manual Trim Validation Logic Guide
              </h3>
              <p className="text-xs text-slate-500">
                Mathematical specification and digital multiplexer mechanics
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

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto text-xs text-slate-700">
          {/* Section 1: The Core Rule */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Bit-Level Multiplexing Rule</span>
            </h4>
            <p className="leading-relaxed text-slate-700">
              For every 8-bit register byte (Bit 7 down to Bit 0), each bit in the <strong className="text-sky-800">Incoming value</strong> is
              evaluated against the corresponding bit in the <strong className="text-amber-800">Mask value</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                <span className="font-mono text-sky-800 font-bold block mb-1">
                  Mask Bit == 0
                </span>
                <span className="text-slate-700">
                  The bit is <strong>passed through</strong> directly from the <strong>Incoming value</strong>.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-mono text-amber-800 font-bold block mb-1">
                  Mask Bit == 1
                </span>
                <span className="text-slate-700">
                  The bit is <strong>replaced/trimmed</strong> by the corresponding bit from the <strong>Validate value</strong>.
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 font-mono text-[11px] text-slate-600">
              Formula: <code className="text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded font-bold">Result = (Incoming &amp; ~Mask) | (Validate &amp; Mask)</code>
            </div>
          </div>

          {/* Section 2: Chaining Rule */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sequential Stage Chaining</span>
            </h4>
            <p className="leading-relaxed text-slate-700">
              The user enters the number of occurrences (1 to 10):
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-slate-700">
              <li>
                <strong className="text-slate-900">Row #1:</strong> The user specifies the initial <code className="text-sky-800 font-mono font-semibold">Incoming Value</code>, <code className="text-amber-800 font-mono font-semibold">Mask Value</code>, and <code className="text-emerald-800 font-mono font-semibold">Validate Value</code>.
              </li>
              <li>
                <strong className="text-slate-900">Row #2 to #N:</strong> The <code className="text-sky-800 font-mono font-semibold">Incoming Value</code> is <em>automatically locked</em> to the <code className="text-blue-700 font-mono font-semibold">Result Value</code> calculated by the immediately preceding row.
              </li>
              <li>
                <strong className="text-slate-900">Final Output:</strong> Displayed in both 2-digit HEX and 8-bit Binary representation.
              </li>
            </ul>
          </div>

          {/* Section 3: Truth Table */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Single-Bit Multiplexer Truth Table
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px] border-collapse bg-white rounded-lg border border-slate-200">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600">
                    <th className="py-2 px-3">Incoming (I)</th>
                    <th className="py-2 px-3">Mask (M)</th>
                    <th className="py-2 px-3">Validate (V)</th>
                    <th className="py-2 px-3 text-blue-700 font-bold">Result (R)</th>
                    <th className="py-2 px-3 font-sans font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-1.5 px-3">0</td><td className="py-1.5 px-3 text-slate-500">0</td><td className="py-1.5 px-3 text-slate-400">x</td><td className="py-1.5 px-3 text-sky-800 font-bold">0</td><td className="py-1.5 px-3 font-sans text-sky-700 font-medium">Pass Incoming</td></tr>
                  <tr><td className="py-1.5 px-3">1</td><td className="py-1.5 px-3 text-slate-500">0</td><td className="py-1.5 px-3 text-slate-400">x</td><td className="py-1.5 px-3 text-sky-800 font-bold">1</td><td className="py-1.5 px-3 font-sans text-sky-700 font-medium">Pass Incoming</td></tr>
                  <tr><td className="py-1.5 px-3 text-slate-400">x</td><td className="py-1.5 px-3 text-amber-700 font-bold">1</td><td className="py-1.5 px-3">0</td><td className="py-1.5 px-3 text-amber-800 font-bold">0</td><td className="py-1.5 px-3 font-sans text-amber-700 font-medium">Inject Validate</td></tr>
                  <tr><td className="py-1.5 px-3 text-slate-400">x</td><td className="py-1.5 px-3 text-amber-700 font-bold">1</td><td className="py-1.5 px-3">1</td><td className="py-1.5 px-3 text-amber-800 font-bold">1</td><td className="py-1.5 px-3 font-sans text-amber-700 font-medium">Inject Validate</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
