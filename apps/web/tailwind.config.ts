import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Placeholder palette — refine to NBR brand guidelines once approved.
        brand: {
          DEFAULT: '#0B3D91',
          dark: '#072A66',
          light: '#3B69C0',
        },
      },
    },
  },
  plugins: [],
};

export default config;
