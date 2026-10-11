module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        danger: '#dc2626',
        'budget-over': '#fecaca', // rouge-200
        'budget-ok': '#bfdbfe', // bleu-200
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c'
        }
      }
    },
  },
  plugins: [],
}