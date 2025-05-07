/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'tim-blue': '#00348D',
        'tim-red': '#E40613',
        'tim-light-blue': '#E6F0FF',
        'tim-light-red': '#FFE6E8',
        'tim-light-green': '#E6F9F0',
        'tim-light-yellow': '#FFF8E6',
        'tim-light-purple': '#F0E6FF',
        'tim-light-gray': '#F0F0F0',
        'tim-dark-blue': '#002266',
        'tim-dark-green': '#006644',
        'tim-dark-purple': '#4B0082',
        'tim-dark-gray': '#4A4A4A',
        'tim-amber': '#CD7F32',
      },
      boxShadow: {
        'tim-card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'tim-button': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'tim': '0.5rem',
      },
    },
  },
  plugins: [],
}
