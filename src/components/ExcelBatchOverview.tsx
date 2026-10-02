import React from 'react';
import { ComputedTargetRegister } from '../types/trim';
import { FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';
import { exportRegistersToExcel } from '../utils/excel';

interface ExcelBatchOverviewProps {
  computedRegisters: ComputedTargetRegister[];
}

export const ExcelBatchOverview: React.FC<ExcelBatchOverviewProps> = ({
  computedRegisters,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel Batch Output Preview &mdash; All Target Addresses</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            This exact consolidated matrix is generated when you download the Excel (.xlsx) file.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportRegistersToExcel(computedRegisters)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Excel (.xlsx)</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-3">Target Address</th>
              <th className="py-2.5 px-2 text-center">Stage</th>
              <th className="py-2.5 px-3">Incoming (HEX)</th>
              <th className="py-2.5 px-3">Mask (HEX)</th>
              <th className="py-2.5 px-3">Validate (HEX)</th>
              <th className="py-2.5 px-3 text-blue-700 font-bold">Result Value (HEX)</th>
              <th className="py-2.5 px-3">Result (Binary)</th>
              <th className="py-2.5 px-2 text-center">Decimal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {computedRegisters.map((reg) =>
              reg.pipeline.map((stage, sIdx) => (
                <tr
                  key={`${reg.id}-${sIdx}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {sIdx === 0 ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {reg.addressLabel}
                      </span>
                    ) : (
                      <span className="text-slate-400 pl-2">&bull;</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-600 font-semibold">
                    #{sIdx + 1}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-bold">
                    0x{stage.incomingHexFormatted}
                  </td>
                  <td className="py-2.5 px-3 text-amber-800 font-bold">
                    0x{stage.maskHexFormatted}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-800 font-bold">
                    0x{stage.validateHexFormatted}
                  </td>
                  <td className="py-2.5 px-3 text-blue-700 font-bold text-sm bg-blue-50/50">
                    0x{stage.resultHexFormatted}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {stage.resultBinFormatted}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-500">
                    {stage.resultVal}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
