import React, { useState } from 'react';
import { ComputedRow } from '../types/trim';
import { generateCCode, generateCSV } from '../utils/bitwise';
import { X, Copy, Check, Download, FileCode, FileSpreadsheet, FileJson } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: ComputedRow[];
  addressLabel: string;
  initialIncoming: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pipeline,
  addressLabel,
  initialIncoming,
}) => {
  const [activeTab, setActiveTab] = useState<'c' | 'csv' | 'json' | 'verilog'>('c');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cCode = generateCCode(addressLabel, initialIncoming, pipeline);
  const csvData = generateCSV(pipeline);
  const jsonData = JSON.stringify(
    {
      targetAddress: addressLabel,
      initialIncomingHex: `0x${pipeline[0]?.incomingHexFormatted || '00'}`,
      finalResultHex: `0x${pipeline[pipeline.length - 1]?.resultHexFormatted || '00'}`,
      finalResultBinary: pipeline[pipeline.length - 1]?.resultBinFormatted || '00000000',
      stages: pipeline.map((p, idx) => ({
        stage: idx + 1,
        incomingHex: `0x${p.incomingHexFormatted}`,
        maskHex: `0x${p.maskHexFormatted}`,
        validateHex: `0x${p.validateHexFormatted}`,
        resultHex: `0x${p.resultHexFormatted}`,
        resultBinary: p.resultBinFormatted,
        note: p.row.notes || '',
      })),
    },
    null,
    2
  );

  const verilogCode = `// Verilog Testbench Stimulus for Register ${addressLabel}
initial begin
  reg [7:0] reg_val = 8'h${pipeline[0]?.incomingHexFormatted || '00'};
  
${pipeline.map((p, idx) => `  // Stage #${idx + 1}
  reg_val = (reg_val & ~8'h${p.maskHexFormatted}) | (8'h${p.validateHexFormatted} & 8'h${p.maskHexFormatted});
  assert(reg_val === 8'h${p.resultHexFormatted}) else $error("Stage ${idx + 1} mismatch!");`).join('\n\n')}
  
  $display("Trim validation verified. Final Result: 0x%02h (0b%08b)", reg_val, reg_val);
end`;

  let currentContent = '';
  let filename = '';
  let mimeType = '';

  switch (activeTab) {
    case 'c':
      currentContent = cCode;
      filename = `trim_${addressLabel.replace(/[^a-zA-Z0-9]/g, '_')}.c`;
      mimeType = 'text/plain';
      break;
    case 'csv':
      currentContent = csvData;
      filename = `trim_${addressLabel.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
      mimeType = 'text/csv';
      break;
    case 'json':
      currentContent = jsonData;
      filename = `trim_${addressLabel.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      mimeType = 'application/json';
      break;
    case 'verilog':
      currentContent = verilogCode;
      filename = `trim_${addressLabel.replace(/[^a-zA-Z0-9]/g, '_')}_tb.v`;
      mimeType = 'text/plain';
      break;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Export Trim Validation Artifacts
              </h3>
              <p className="text-xs text-slate-500">
                Generate source code, firmware macros, verification vectors, or spreadsheets
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

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-5 pt-3 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('c')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'c'
                ? 'bg-white text-blue-700 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>C/C++ Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'csv'
                ? 'bg-white text-blue-700 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Vector Table</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-white text-blue-700 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON Object</span>
          </button>

          <button
            onClick={() => setActiveTab('verilog')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'verilog'
                ? 'bg-white text-blue-700 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Verilog Testbench</span>
          </button>
        </div>

        {/* Code/Data Preview Area */}
        <div className="p-5 flex-1 overflow-hidden flex flex-col bg-slate-50">
          <div className="relative flex-1 overflow-auto rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <pre className="font-mono text-xs text-slate-800 whitespace-pre leading-relaxed">
              {currentContent}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono font-medium">
            {filename}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors flex items-center gap-1.5 border border-slate-200 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
