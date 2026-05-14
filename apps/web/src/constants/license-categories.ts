export const LICENSE_CATEGORY_VALUES = [
  'Microfinance',
  'Credit Union',
  'Commercial Bank',
  'Payment Service Provider',
  'Forex Bureau',
] as const;

export const LICENSE_CATEGORY_OPTIONS = LICENSE_CATEGORY_VALUES.map((value) => ({
  value,
  label: value,
}));
