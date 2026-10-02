import React, { useRef } from 'react';
import { TargetRegister, ComputedTargetRegister } from '../types/trim';
import { exportRegistersToExcel, downloadExcelTemplate, parseExcelFile } from '../utils/excel';
import { Plus, Trash2, FileSpreadsheet, Upload, Download, Layers, CheckCircle2 } from 'lucide-react';

interface AddressManagerProps {
  registers: TargetRegister[];
  computedRegisters: ComputedTargetRegister[];
  activeRegisterId: string;
  onSelectRegister: (id: string) => void;
  onAddRegister: () => void;
  onRemoveRegister: (id: string) => void;
  onImportRegisters: (imported: TargetRegister[]) => void;
}

export const AddressManager: React.FC<AddressManagerProps> = ({
  registers,
  computedRegisters,
  activeRegisterId,
  onSelectRegister,
  onAddRegister,
  onRemoveRegister,
  onImportRegisters,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    exportRegistersToExcel(computedRegisters);
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await parseExcelFile(file);
      if (imported.length > 0) {
        onImportRegisters(imported);
      }
    } catch (err: any) {
      alert(`Could not parse Excel file: ${err.message || 'Unknown error'}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Target Addresses &amp; Register Profiles</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              ({registers.length} address{registers.length > 1 ? 'es' : ''} in Excel batch)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multiple target addresses. All addresses and their calculated HEX result rows are generated in one Excel file.
          </p>
        </div>

        {/* Excel Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
            title="Import addresses and rows from Excel or CSV file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Import Excel</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
            title="Download an empty Excel template"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Template</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
            title="Export all target addresses and their HEX results to an Excel (.xlsx) file"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Generate Excel File</span>
          </button>
        </div>
      </div>

      {/* Target Address Selector Tabs */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        {computedRegisters.map((comp) => {
          const isActive = comp.id === activeRegisterId;

          return (
            <div
              key={comp.id}
              onClick={() => onSelectRegister(comp.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="font-mono font-bold text-xs">
                  {comp.addressLabel || 'Address'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {comp.occurrences} stg &bull; Res: <strong className="text-blue-700">0x{comp.finalHex}</strong>
                </span>
              </div>

              {registers.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRegister(comp.id);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                  title="Remove this target address"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Address Button */}
        <button
          type="button"
          onClick={onAddRegister}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-dashed border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 text-blue-700 transition-colors flex-shrink-0"
          title="Add another target address to this Excel batch"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Target Address</span>
        </button>
      </div>
    </div>
  );
};
