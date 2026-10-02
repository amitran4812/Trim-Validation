import React from 'react';
import { ComputedRow } from '../types/trim';
import { cleanHexInput } from '../utils/bitwise';
import { ArrowDown, Link2, Eye } from 'lucide-react';

interface TrimTableProps {
  computedRows: ComputedRow[];
  selectedRowIndex: number;
  onSelectRow: (index: number) => void;
  onUpdateFirstIncoming: (val: string) => void;
  onUpdateMask: (index: number, val: string) => void;
  onUpdateValidate: (index: number, val: string) => void;
  onUpdateNotes?: (index: number, val: string) => void;
  addressLabel: string;
}

export const TrimTable: React.FC<TrimTableProps> = ({
  computedRows,
  selectedRowIndex,
  onSelectRow,
  onUpdateFirstIncoming,
  onUpdateMask,
  onUpdateValidate,
  addressLabel,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/80">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <span>Trim Pipeline &mdash; Target Register {addressLabel}</span>
            <span className="text-xs font-normal text-slate-500 font-mono normal-case">
              ({computedRows.length} {computedRows.length === 1 ? 'stage' : 'sequential stages'})
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage 1 receives the initial Incoming Value. Each subsequent stage chains the previous stage's Result Value.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200 inline-block" />
            <span className="text-slate-700 font-medium">Mask=0 (Pass Incoming)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200 inline-block" />
            <span className="text-slate-700 font-medium">Mask=1 (Pass Validate)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3 px-3 w-16 text-center">Stage</th>
              <th className="py-3 px-4 min-w-[190px]">
                <div className="flex items-center gap-1.5">
                  <span>Incoming Value</span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">(HEX &amp; 8-bit BIN)</span>
                </div>
              </th>
              <th className="py-3 px-4 min-w-[190px]">
                <div className="flex items-center gap-1.5">
                  <span>Mask Value</span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">(HEX &amp; 8-bit BIN)</span>
                </div>
              </th>
              <th className="py-3 px-4 min-w-[190px]">
                <div className="flex items-center gap-1.5">
                  <span>Validate Value</span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">(HEX &amp; 8-bit BIN)</span>
                </div>
              </th>
              <th className="py-3 px-4 min-w-[210px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-700 font-bold">Result Value</span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">(HEX &amp; BIN)</span>
                </div>
              </th>
              <th className="py-3 px-3 w-20 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {computedRows.map((stage, idx) => {
              const isSelected = selectedRowIndex === idx;
              const isFirst = stage.isFirstRow;

              const hasMask = stage.hasUserInputs.mask;
              const hasValidate = stage.hasUserInputs.validate;
              const isEvaluated = isFirst ? stage.hasUserInputs.incoming : true;

              return (
                <tr
                  key={stage.row.id || idx}
                  onClick={() => onSelectRow(idx)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/60 hover:bg-blue-50/80 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50/70 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Occurrence / Stage Index */}
                  <td className="py-3 px-3 text-center align-middle">
                    <div className="flex flex-col items-center justify-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        #{idx + 1}
                      </span>
                      {idx < computedRows.length - 1 && (
                        <ArrowDown className="w-3 h-3 text-slate-400 mt-1" />
                      )}
                    </div>
                  </td>

                  {/* Incoming Value Column - Clean with no side suggestions */}
                  <td className="py-3 px-4 align-middle">
                    {isFirst ? (
                      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-xs font-semibold">0x</span>
                          <input
                            type="text"
                            maxLength={2}
                            value={stage.row.incomingHex}
                            onChange={(e) => onUpdateFirstIncoming(cleanHexInput(e.target.value))}
                            placeholder=""
                            className={`w-14 px-2 py-1 bg-white border rounded text-sm font-bold tracking-wider text-slate-900 text-center shadow-xs focus:outline-none focus:ring-2 ${
                              stage.isValidHex.incoming
                                ? 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                                : 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/50'
                            }`}
                          />
                          <span className="text-[10px] text-blue-700 font-sans font-medium px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                            Initial Input
                          </span>
                        </div>
                        {/* Binary Breakdown */}
                        <div className="text-[11px] text-slate-600 font-mono tracking-wider bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                          <span className="text-slate-400 font-sans text-[10px]">bin:</span>
                          <span className="font-semibold text-slate-800">{stage.incomingBinFormatted.slice(0, 4)}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-800">{stage.incomingBinFormatted.slice(4)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-xs font-semibold">0x</span>
                          <span className="text-sm font-bold text-slate-800 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded min-w-[3.5rem] text-center inline-block">
                            {stage.incomingHexFormatted}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-sans px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                            <Link2 className="w-3 h-3 text-blue-600" />
                            <span>from #{idx}</span>
                          </span>
                        </div>
                        {/* Binary Breakdown */}
                        <div className="text-[11px] text-slate-600 font-mono tracking-wider bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                          <span className="text-slate-400 font-sans text-[10px]">bin:</span>
                          <span className="font-semibold text-slate-800">{stage.incomingBinFormatted.slice(0, 4)}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-800">{stage.incomingBinFormatted.slice(4)}</span>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Mask Value Column - NO side values or buttons */}
                  <td className="py-3 px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs font-semibold">0x</span>
                        <input
                          type="text"
                          maxLength={2}
                          value={stage.row.maskHex}
                          onChange={(e) => onUpdateMask(idx, cleanHexInput(e.target.value))}
                          placeholder=""
                          className={`w-14 px-2 py-1 bg-white border rounded text-sm font-bold tracking-wider text-amber-900 text-center shadow-xs focus:outline-none focus:ring-2 ${
                            stage.isValidHex.mask
                              ? 'border-slate-300 focus:border-amber-500 focus:ring-amber-100'
                              : 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/50'
                          }`}
                        />
                      </div>

                      {/* Binary representation */}
                      <div className="text-[11px] font-mono tracking-wider bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                        <span className="text-slate-400 font-sans text-[10px]">bin:</span>
                        {hasMask ? (
                          stage.maskBinFormatted.split('').map((bit, bIdx) => (
                            <span
                              key={bIdx}
                              className={bit === '1' ? 'text-amber-700 font-bold' : 'text-slate-400'}
                            >
                              {bit}
                              {bIdx === 3 ? ' ' : ''}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 font-sans text-[10px]">awaiting input</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Validate Value Column - NO side values or buttons */}
                  <td className="py-3 px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs font-semibold">0x</span>
                        <input
                          type="text"
                          maxLength={2}
                          value={stage.row.validateHex}
                          onChange={(e) => onUpdateValidate(idx, cleanHexInput(e.target.value))}
                          placeholder=""
                          className={`w-14 px-2 py-1 bg-white border rounded text-sm font-bold tracking-wider text-emerald-900 text-center shadow-xs focus:outline-none focus:ring-2 ${
                            stage.isValidHex.validate
                              ? 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
                              : 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/50'
                          }`}
                        />
                      </div>

                      {/* Binary representation */}
                      <div className="text-[11px] text-slate-600 font-mono tracking-wider bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                        <span className="text-slate-400 font-sans text-[10px]">bin:</span>
                        {hasValidate ? (
                          <>
                            <span className="font-semibold text-slate-800">{stage.validateBinFormatted.slice(0, 4)}</span>
                            <span className="text-slate-400">·</span>
                            <span className="font-semibold text-slate-800">{stage.validateBinFormatted.slice(4)}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-sans text-[10px]">awaiting input</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Result Value Column - Always calculated with HEX and Binary */}
                  <td className="py-3 px-4 align-middle">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs font-semibold">0x</span>
                        <span className="text-base font-bold text-blue-700 px-3 py-0.5 bg-blue-50 border border-blue-200 rounded min-w-[3.5rem] text-center inline-block shadow-xs">
                          {stage.resultHexFormatted}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({stage.resultVal} dec)
                        </span>
                      </div>

                      {/* Result Bit Breakdown: with source tags */}
                      <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded border border-slate-200 max-w-fit">
                        {stage.bitBreakdown.map((b) => (
                          <span
                            key={b.bitIndex}
                            title={`Bit ${b.bitIndex}: ${b.resultBit} (from ${b.source.toUpperCase()} because Mask=${b.maskBit})`}
                            className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded ${
                              b.source === 'validate'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-sky-100 text-sky-800 border border-sky-300'
                            }`}
                          >
                            {b.resultBit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Inspection Trigger */}
                  <td className="py-3 px-3 text-center align-middle">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRow(idx);
                      }}
                      className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title="Inspect bitwise multiplexer for this stage"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
