import { TrimRow, ComputedRow, TargetRegister, ComputedTargetRegister } from '../types/trim';

/**
 * Normalizes user input hex string:
 * Removes spaces, leading '0x' or '0X', keeps up to 2 hex digits.
 */
export function cleanHexInput(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();
  if (cleaned.startsWith('0x') || cleaned.startsWith('0X')) {
    cleaned = cleaned.substring(2);
  }
  // Remove non-hex characters
  cleaned = cleaned.replace(/[^0-9a-fA-F]/g, '');
  // Limit to 2 hex digits for 8-bit byte
  return cleaned.slice(0, 2).toUpperCase();
}

/**
 * Validates if string represents a valid 1 or 2 character hex byte.
 * Empty string is valid (clean awaiting input state).
 */
export function isValidHex(hexStr: string): boolean {
  if (!hexStr || hexStr.trim() === '') return true;
  const clean = cleanHexInput(hexStr);
  return clean.length > 0 && /^[0-9A-F]{1,2}$/i.test(clean);
}

/**
 * Checks if a string has non-empty hex input
 */
export function hasHexInput(hexStr: string): boolean {
  if (!hexStr) return false;
  return cleanHexInput(hexStr).length > 0;
}

/**
 * Parses hex string into integer (0-255).
 * Falls back to defaultValue if invalid or empty.
 */
export function parseHexByte(hexStr: string, defaultValue = 0): number {
  if (!hasHexInput(hexStr)) return defaultValue;
  const cleaned = cleanHexInput(hexStr);
  const parsed = parseInt(cleaned, 16);
  if (isNaN(parsed)) return defaultValue;
  return Math.max(0, Math.min(255, parsed));
}

/**
 * Formats a number (0-255) as a 2-digit uppercase HEX string.
 */
export function toHexByte(val: number): string {
  const clamped = Math.max(0, Math.min(255, Math.floor(val)));
  return clamped.toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Formats a number (0-255) as an 8-digit binary string (MSB to LSB).
 */
export function toBinByte(val: number): string {
  const clamped = Math.max(0, Math.min(255, Math.floor(val)));
  return (clamped >>> 0).toString(2).padStart(8, '0');
}

/**
 * Computes trim result according to the specification:
 * For each binary bit:
 * - If mask bit is 0, incoming bit is passed.
 * - If mask bit is 1, validate bit is passed.
 * Formula: (incoming & (~mask)) | (validate & mask)
 */
export function calculateTrimByte(incoming: number, mask: number, validate: number): number {
  const inc = incoming & 0xFF;
  const msk = mask & 0xFF;
  const val = validate & 0xFF;
  const result = (inc & (~msk & 0xFF)) | (val & msk);
  return result & 0xFF;
}

/**
 * Toggles a single bit (0-7) of a byte value and returns the new byte.
 */
export function toggleBit(val: number, bitIndex: number): number {
  return (val ^ (1 << bitIndex)) & 0xFF;
}

/**
 * Computes the entire chained pipeline of trim stages for a given set of rows.
 */
export function computePipeline(
  rows: TrimRow[],
  occurrences: number
): ComputedRow[] {
  const activeCount = Math.max(1, Math.min(10, occurrences));
  const activeRows = rows.slice(0, activeCount);
  const computed: ComputedRow[] = [];

  let currentIncomingVal = 0;

  for (let i = 0; i < activeRows.length; i++) {
    const row = activeRows[i];
    const isFirst = i === 0;

    let incomingVal: number;
    let isIncomingValid = true;
    const hasIncomingInput = hasHexInput(row.incomingHex);

    if (isFirst) {
      isIncomingValid = isValidHex(row.incomingHex);
      incomingVal = parseHexByte(row.incomingHex, 0);
    } else {
      // Inherited from previous row's result!
      incomingVal = currentIncomingVal;
      isIncomingValid = true;
    }

    const hasMaskInput = hasHexInput(row.maskHex);
    const isMaskValid = isValidHex(row.maskHex);
    const maskVal = parseHexByte(row.maskHex, 0);

    const hasValidateInput = hasHexInput(row.validateHex);
    const isValidateValid = isValidHex(row.validateHex);
    const validateVal = parseHexByte(row.validateHex, 0);

    // Compute result
    const resultVal = calculateTrimByte(incomingVal, maskVal, validateVal);
    currentIncomingVal = resultVal;

    // Detailed bit breakdown (MSB bit 7 down to LSB bit 0)
    const bitBreakdown = [];
    for (let b = 7; b >= 0; b--) {
      const bitMask = 1 << b;
      const iBit = (incomingVal & bitMask) ? 1 : 0;
      const mBit = (maskVal & bitMask) ? 1 : 0;
      const vBit = (validateVal & bitMask) ? 1 : 0;
      const rBit = (resultVal & bitMask) ? 1 : 0;
      const source: 'incoming' | 'validate' = mBit === 1 ? 'validate' : 'incoming';

      bitBreakdown.push({
        bitIndex: b,
        incomingBit: iBit,
        maskBit: mBit,
        validateBit: vBit,
        resultBit: rBit,
        source,
      });
    }

    computed.push({
      row: {
        ...row,
        incomingHex: isFirst ? row.incomingHex : toHexByte(incomingVal),
      },
      isFirstRow: isFirst,
      incomingVal,
      maskVal,
      validateVal,
      resultVal,
      incomingHexFormatted: toHexByte(incomingVal),
      maskHexFormatted: toHexByte(maskVal),
      validateHexFormatted: toHexByte(validateVal),
      resultHexFormatted: toHexByte(resultVal),
      incomingBinFormatted: toBinByte(incomingVal),
      maskBinFormatted: toBinByte(maskVal),
      validateBinFormatted: toBinByte(validateVal),
      resultBinFormatted: toBinByte(resultVal),
      hasUserInputs: {
        incoming: hasIncomingInput,
        mask: hasMaskInput,
        validate: hasValidateInput,
      },
      bitBreakdown,
      isValidHex: {
        incoming: isIncomingValid,
        mask: isMaskValid,
        validate: isValidateValid,
      },
    });
  }

  return computed;
}

/**
 * Computes full pipeline and metadata for a TargetRegister
 */
export function computeTargetRegister(register: TargetRegister): ComputedTargetRegister {
  const pipeline = computePipeline(register.rows, register.occurrences);
  const initialHex = pipeline[0]?.incomingHexFormatted || '00';
  const initialBin = pipeline[0]?.incomingBinFormatted || '00000000';
  const finalStage = pipeline[pipeline.length - 1];

  return {
    id: register.id,
    addressLabel: register.addressLabel || '0x00',
    occurrences: register.occurrences,
    pipeline,
    initialHex,
    initialBin,
    finalHex: finalStage?.resultHexFormatted || '00',
    finalBin: finalStage?.resultBinFormatted || '00000000',
    finalDec: finalStage?.resultVal ?? 0,
  };
}

/**
 * Creates a clean default row list without any suggested values
 */
export function createBlankRows(): TrimRow[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `row-${i + 1}-${Date.now()}`,
    occurrenceIndex: i,
    incomingHex: '',
    maskHex: '',
    validateHex: '',
    notes: '',
  }));
}

/**
 * Generates C code snippet representing the trim sequence
 */
export function generateCCode(
  addressLabel: string,
  initialIncomingHex: string,
  pipeline: ComputedRow[]
): string {
  const lines = [
    `/* Manual Trim Sequence for Register ${addressLabel} */`,
    `#include <stdint.h>`,
    ``,
    `// Initial Register Value: 0x${initialIncomingHex}`,
    `uint8_t trim_register_${addressLabel.replace(/[^a-zA-Z0-9_]/g, '')}(uint8_t incoming) {`,
    `    uint8_t reg = incoming;`,
    ``,
  ];

  pipeline.forEach((stage, idx) => {
    lines.push(`    // Occurrence #${idx + 1}${stage.row.notes ? ` - ${stage.row.notes}` : ''}`);
    lines.push(`    // Mask: 0x${stage.maskHexFormatted} (0b${stage.maskBinFormatted}), Validate: 0x${stage.validateHexFormatted}`);
    lines.push(`    reg = (reg & ~0x${stage.maskHexFormatted}) | (0x${stage.validateHexFormatted} & 0x${stage.maskHexFormatted}); // -> 0x${stage.resultHexFormatted}`);
    lines.push(``);
  });

  const finalResult = pipeline[pipeline.length - 1];
  lines.push(`    // Final Result: 0x${finalResult ? finalResult.resultHexFormatted : '00'} (0b${finalResult ? finalResult.resultBinFormatted : '00000000'})`);
  lines.push(`    return reg;`);
  lines.push(`}`);

  return lines.join('\n');
}

/**
 * Generates CSV string of the trim sequence
 */
export function generateCSV(pipeline: ComputedRow[]): string {
  const headers = [
    'Occurrence',
    'Incoming_HEX',
    'Incoming_BIN',
    'Mask_HEX',
    'Mask_BIN',
    'Validate_HEX',
    'Validate_BIN',
    'Result_HEX',
    'Result_BIN',
    'Notes',
  ];

  const rows = pipeline.map((p, idx) => [
    idx + 1,
    `0x${p.incomingHexFormatted}`,
    `0b${p.incomingBinFormatted}`,
    `0x${p.maskHexFormatted}`,
    `0b${p.maskBinFormatted}`,
    `0x${p.validateHexFormatted}`,
    `0b${p.validateBinFormatted}`,
    `0x${p.resultHexFormatted}`,
    `0b${p.resultBinFormatted}`,
    `"${p.row.notes || ''}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
