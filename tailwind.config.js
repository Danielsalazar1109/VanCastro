/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        bannerImg: "url('https://s3-alpha-sig.figma.com/img/45e9/423e/2dc38ee404cc635b84707d93aa5a6524?Expires=1742774400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=VMXMHevcGX0b8QK5iIQ6FuPJaMFS~UGYczd4yPgqp9usd~mFDy1hP4gdxq~lNOV1hJTAfJ6JtO7NVVTcsVV9wqWyMP6b4zVa-gUk4XNy3rdexnHkwjYKDa23D0zMvOlfkw-zWEsODP8wbnNtOGyGelz-frhPYaZDzczPhmJXJC6ybqQK4E3LJ1LMrRVUimZieJI828W2rpbkB~nkKlC7nFwRHuVd4IKJ7EejEbGwcNJPRO5I2UHqFx-uBrIVXmSV4nfpSUqL5wEYCJr4Wr6bDNY2s9emy33YKB2HDoRpvBOTDK~VS2gYS8L5w548Owe1sy14M9aVgXyH~rc-0JDKyw__')",
        blackOverlay: "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%)"
      },
      colors: {
        // Brand colors from header and footer
        brand: {
          dark: '#1c1917', // stone-900
          yellow: {
            DEFAULT: '#facc15', // yellow-400
            hover: '#eab308', // yellow-500
          },
          gray: '#6b7280', // gray-500
        },
        // Original primary and secondary colors kept for backward compatibility
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
