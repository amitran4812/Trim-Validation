export interface TrimRow {
  id: string;
  occurrenceIndex: number; // 0-based: 0 for 1st occurrence, etc.
  incomingHex: string;     // empty string when unentered
  maskHex: string;         // empty string when unentered
  validateHex: string;     // empty string when unentered
  notes?: string;          // optional field
}

export interface ComputedRow {
  row: TrimRow;
  isFirstRow: boolean;
  incomingVal: number;     // 0-255
  maskVal: number;         // 0-255
  validateVal: number;     // 0-255
  resultVal: number;       // 0-255
  incomingHexFormatted: string;
  maskHexFormatted: string;
  validateHexFormatted: string;
  resultHexFormatted: string;
  incomingBinFormatted: string;
  maskBinFormatted: string;
  validateBinFormatted: string;
  resultBinFormatted: string;
  hasUserInputs: {
    incoming: boolean;
    mask: boolean;
    validate: boolean;
  };
  bitBreakdown: {
    bitIndex: number;
    incomingBit: number; // 0 or 1
    maskBit: number;     // 0 or 1
    validateBit: number; // 0 or 1
    resultBit: number;   // 0 or 1
    source: 'incoming' | 'validate';
  }[];
  isValidHex: {
    incoming: boolean;
    mask: boolean;
    validate: boolean;
  };
}

export interface TargetRegister {
  id: string;
  addressLabel: string;    // e.g. "0x3A"
  occurrences: number;     // 1 to 10
  rows: TrimRow[];         // rows for this address
}

export interface ComputedTargetRegister {
  id: string;
  addressLabel: string;
  occurrences: number;
  pipeline: ComputedRow[];
  initialHex: string;
  initialBin: string;
  finalHex: string;
  finalBin: string;
  finalDec: number;
}

export interface TrimPreset {
  name: string;
  description: string;
  occurrences: number;
  addressLabel: string;
  initialIncoming: string;
  rows: {
    mask: string;
    validate: string;
    notes?: string;
  }[];
}
