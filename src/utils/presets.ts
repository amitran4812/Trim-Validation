import { TrimPreset } from '../types/trim';

export const TRIM_PRESETS: TrimPreset[] = [
  {
    name: 'Precision Bandgap Reference Trim',
    description: '3-stage calibration: Coarse trim (bits 7-4), fine trim (bits 3-1), and temperature coefficient polarity bit (bit 0).',
    occurrences: 3,
    addressLabel: '0x3A',
    initialIncoming: '00',
    rows: [
      { mask: 'F0', validate: '90', notes: 'Coarse voltage trim [7:4] -> 1001' },
      { mask: '0E', validate: '0A', notes: 'Fine linearity trim [3:1] -> 101' },
      { mask: '01', validate: '01', notes: 'Temp coefficient sign [0] -> 1' },
    ],
  },
  {
    name: 'ADC Offset & Gain Calibration',
    description: '4-stage register trim: Zero-offset cancellation, span gain correction, input buffer enable, and comparator strobe.',
    occurrences: 4,
    addressLabel: '0x1C',
    initialIncoming: 'FF',
    rows: [
      { mask: '07', validate: '04', notes: 'Offset cancel bits [2:0]' },
      { mask: '38', validate: '20', notes: 'Gain calibration [5:3]' },
      { mask: '40', validate: '00', notes: 'Clear test mode bit [6]' },
      { mask: '80', validate: '80', notes: 'Lock trim register bit [7]' },
    ],
  },
  {
    name: 'Internal RC Oscillator Trim',
    description: '2-stage factory trim: Frequency coarse centering and temperature compensation curves.',
    occurrences: 2,
    addressLabel: '0x05',
    initialIncoming: '80',
    rows: [
      { mask: '3F', validate: '2B', notes: 'Center frequency trim [5:0]' },
      { mask: 'C0', validate: '40', notes: 'Temp compensation mode [7:6]' },
    ],
  },
  {
    name: 'Full 8-Stage Sequential Bit Stepping',
    description: '8 occurrences: Each stage masks and programs exactly one bit from MSB (bit 7) down to LSB (bit 0).',
    occurrences: 8,
    addressLabel: '0x7E',
    initialIncoming: 'AA',
    rows: [
      { mask: '80', validate: '00', notes: 'Clear bit 7' },
      { mask: '40', validate: '40', notes: 'Set bit 6' },
      { mask: '20', validate: '00', notes: 'Clear bit 5' },
      { mask: '10', validate: '10', notes: 'Set bit 4' },
      { mask: '08', validate: '00', notes: 'Clear bit 3' },
      { mask: '04', validate: '04', notes: 'Set bit 2' },
      { mask: '02', validate: '00', notes: 'Clear bit 1' },
      { mask: '01', validate: '01', notes: 'Set bit 0' },
    ],
  },
];
