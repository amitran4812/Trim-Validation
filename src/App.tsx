import React, { useState, useMemo } from 'react';
import { TargetRegister, ComputedTargetRegister, TrimPreset } from './types/trim';
import {
  computeTargetRegister,
  createBlankRows,
  cleanHexInput,
} from './utils/bitwise';
import { Header } from './components/Header';
import { AddressManager } from './components/AddressManager';
import { OccurrenceControl } from './components/OccurrenceControl';
import { TrimTable } from './components/TrimTable';
import { BitInspector } from './components/BitInspector';
import { FinalResultCard } from './components/FinalResultCard';
import { ExcelBatchOverview } from './components/ExcelBatchOverview';
import { PresetSelector } from './components/PresetSelector';
import { ExportModal } from './components/ExportModal';
import { LogicGuide } from './components/LogicGuide';
import { exportRegistersToExcel } from './utils/excel';

// Initial clean register list with NO suggested values pre-filled in columns
const createInitialRegisters = (): TargetRegister[] => [
  {
    id: 'reg-addr-1',
    addressLabel: '0x10',
    occurrences: 3,
    rows: createBlankRows(),
  },
];

export default function App() {
  const [registers, setRegisters] = useState<TargetRegister[]>(createInitialRegisters);
  const [activeRegisterId, setActiveRegisterId] = useState<string>('reg-addr-1');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'editor' | 'batch_overview'>('editor');

  // Modal Dialogs
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Compute all target registers
  const computedRegisters: ComputedTargetRegister[] = useMemo(() => {
    return registers.map((reg) => computeTargetRegister(reg));
  }, [registers]);

  // Current active register
  const activeRegister = registers.find((r) => r.id === activeRegisterId) || registers[0];
  const activeComputed = computedRegisters.find((r) => r.id === activeRegisterId) || computedRegisters[0];

  // Active pipeline & clamping
  const currentPipeline = activeComputed?.pipeline || [];
  const clampedSelectedRowIndex = Math.min(
    selectedRowIndex,
    Math.max(0, currentPipeline.length - 1)
  );
  const currentInspectedStage = currentPipeline[clampedSelectedRowIndex] || currentPipeline[0];

  // Handlers for modifying the active register
  const handleUpdateAddressLabel = (newLabel: string) => {
    setRegisters((prev) =>
      prev.map((reg) =>
        reg.id === activeRegister.id ? { ...reg, addressLabel: newLabel } : reg
      )
    );
  };

  const handleUpdateOccurrences = (count: number) => {
    const clamped = Math.max(1, Math.min(10, count));
    setRegisters((prev) =>
      prev.map((reg) =>
        reg.id === activeRegister.id ? { ...reg, occurrences: clamped } : reg
      )
    );
    if (selectedRowIndex >= clamped) {
      setSelectedRowIndex(clamped - 1);
    }
  };

  const handleUpdateFirstIncoming = (newHex: string) => {
    setRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id !== activeRegister.id) return reg;
        const newRows = [...reg.rows];
        newRows[0] = { ...newRows[0], incomingHex: newHex };
        return { ...reg, rows: newRows };
      })
    );
  };

  const handleUpdateMask = (index: number, newHex: string) => {
    setRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id !== activeRegister.id) return reg;
        const newRows = [...reg.rows];
        if (newRows[index]) {
          newRows[index] = { ...newRows[index], maskHex: newHex };
        }
        return { ...reg, rows: newRows };
      })
    );
  };

  const handleUpdateValidate = (index: number, newHex: string) => {
    setRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id !== activeRegister.id) return reg;
        const newRows = [...reg.rows];
        if (newRows[index]) {
          newRows[index] = { ...newRows[index], validateHex: newHex };
        }
        return { ...reg, rows: newRows };
      })
    );
  };

  // Add a new target address
  const handleAddRegister = () => {
    const nextIdx = registers.length + 1;
    const defaultHexAddr = `0x${((nextIdx * 16) & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;
    const newReg: TargetRegister = {
      id: `reg-${Date.now()}-${Math.random()}`,
      addressLabel: defaultHexAddr,
      occurrences: 3,
      rows: createBlankRows(),
    };
    setRegisters((prev) => [...prev, newReg]);
    setActiveRegisterId(newReg.id);
    setSelectedRowIndex(0);
  };

  // Remove a target address
  const handleRemoveRegister = (id: string) => {
    if (registers.length <= 1) return;
    const remaining = registers.filter((r) => r.id !== id);
    setRegisters(remaining);
    if (activeRegisterId === id) {
      setActiveRegisterId(remaining[0].id);
      setSelectedRowIndex(0);
    }
  };

  // Import registers from Excel file
  const handleImportRegisters = (imported: TargetRegister[]) => {
    if (!imported || imported.length === 0) return;
    setRegisters(imported);
    setActiveRegisterId(imported[0].id);
    setSelectedRowIndex(0);
  };

  // Reset all to clean initial state
  const handleReset = () => {
    const blank = createInitialRegisters();
    setRegisters(blank);
    setActiveRegisterId(blank[0].id);
    setSelectedRowIndex(0);
  };

  // Load a preset for the current address
  const handleSelectPreset = (preset: TrimPreset) => {
    setRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id !== activeRegister.id) return reg;
        const updatedRows = createBlankRows();
        updatedRows[0].incomingHex = preset.initialIncoming;

        preset.rows.forEach((r, idx) => {
          if (updatedRows[idx]) {
            updatedRows[idx].maskHex = r.mask;
            updatedRows[idx].validateHex = r.validate;
            if (r.notes) updatedRows[idx].notes = r.notes;
          }
        });

        return {
          ...reg,
          addressLabel: preset.addressLabel,
          occurrences: preset.occurrences,
          rows: updatedRows,
        };
      })
    );
    setSelectedRowIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top Header */}
      <Header
        onReset={handleReset}
        onOpenPresets={() => setShowPresets(true)}
        onOpenExport={() => setShowExport(true)}
        onToggleHelp={() => setShowHelp(!showHelp)}
        showHelp={showHelp}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step 1: Target Addresses / Registers Manager & Excel Generation */}
        <section aria-label="Target Addresses and Excel Export Bar">
          <AddressManager
            registers={registers}
            computedRegisters={computedRegisters}
            activeRegisterId={activeRegister.id}
            onSelectRegister={setActiveRegisterId}
            onAddRegister={handleAddRegister}
            onRemoveRegister={handleRemoveRegister}
            onImportRegisters={handleImportRegisters}
          />
        </section>

        {/* View Switcher: Single Address Editor vs All Addresses Excel Table */}
        <div className="flex items-center justify-between">
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'editor'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stage Pipeline Editor ({activeRegister.addressLabel})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('batch_overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'batch_overview'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Addresses Excel Preview ({registers.length} addresses)
            </button>
          </div>

          <button
            type="button"
            onClick={() => exportRegistersToExcel(computedRegisters)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
          >
            Download Excel with HEX Results (.xlsx)
          </button>
        </div>

        {viewMode === 'editor' ? (
          <>
            {/* Step 2: Configuration of Address & Number of Occurrences */}
            <section aria-label="Trim Address and Occurrences Configuration">
              <OccurrenceControl
                occurrences={activeRegister.occurrences}
                onOccurrencesChange={handleUpdateOccurrences}
                addressLabel={activeRegister.addressLabel}
                onAddressLabelChange={handleUpdateAddressLabel}
              />
            </section>

            {/* Step 3: The Core Trim Execution Pipeline Table (NO suggested/side values) */}
            <section aria-label="Trim Pipeline Execution Table">
              <TrimTable
                computedRows={currentPipeline}
                selectedRowIndex={clampedSelectedRowIndex}
                onSelectRow={setSelectedRowIndex}
                onUpdateFirstIncoming={handleUpdateFirstIncoming}
                onUpdateMask={handleUpdateMask}
                onUpdateValidate={handleUpdateValidate}
                addressLabel={activeRegister.addressLabel}
              />
            </section>

            {/* Step 4: Interactive Bit-Level Multiplexer Circuit Inspector */}
            {currentInspectedStage && (
              <section aria-label="Bitwise Multiplexer Circuit Inspector">
                <BitInspector
                  stage={currentInspectedStage}
                  stageIndex={clampedSelectedRowIndex}
                  totalStages={currentPipeline.length}
                  onUpdateMask={handleUpdateMask}
                  onUpdateValidate={handleUpdateValidate}
                  onUpdateFirstIncoming={handleUpdateFirstIncoming}
                />
              </section>
            )}

            {/* Step 5: Final Result Showcase (HEX and Binary) */}
            <section aria-label="Final Register Result">
              <FinalResultCard
                pipeline={currentPipeline}
                addressLabel={activeRegister.addressLabel}
              />
            </section>
          </>
        ) : (
          <section aria-label="All Target Addresses Excel Matrix">
            <ExcelBatchOverview computedRegisters={computedRegisters} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Manual Trim Validation Engine &bull; Bitwise Hardware Register Verification</span>
          <span>Excel Multi-Address Export &bull; 8-bit Hex/Binary Chained Pipeline</span>
        </div>
      </footer>

      {/* Modals */}
      <PresetSelector
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        onSelectPreset={handleSelectPreset}
      />

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        pipeline={currentPipeline}
        addressLabel={activeRegister.addressLabel}
        initialIncoming={activeRegister.rows[0].incomingHex}
      />

      <LogicGuide
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}
