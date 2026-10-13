/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0D1117',
        surface:  '#151B23',
        surface2: '#1B232D',
        border:   '#26303B',
        accent:   '#34D399',
        accentDim:'#0F3D2E',
        danger:   '#F87171',
        warn:     '#FBBF24',
        muted:    '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.35), 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      borderRadius: { xl2: '1rem' },
    },
  },
  plugins: [],
}
