// tailwind.config.js
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/component/**/*.{js,ts,jsx,tsx}",
    "./src/layout/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    fontFamily: {
      sans: ["Assistant", "Arial", "sans-serif"],
      serif: ["Assistant", "sans-serif"],
      DejaVu: ["Assistant", "Arial", "sans-serif"],
    },
    extend: {
      height: {
        header: "560px",
      },
      backgroundImage: {
        "page-header": "url('/page-header-bg.jpg')",
        "contact-header": "url('/page-header-bg-2.jpg')",
        subscribe: "url('/subscribe-bg.jpg')",
        "app-download": "url('/app-download.jpg')",
        cta: "url('/cta-bg.png')",
        "cta-1": "url('/cta/cta-bg-1.png')",
        "cta-2": "url('/cta/cta-bg-2.png')",
        "cta-3": "url('/cta/cta-bg-3.png')",
      },
      colors: {
        customBrown: {
          light: 'rgb(243, 244, 246)',
          DEFAULT: '#845333',
          dark: '#845333',
        },
        customGreen: {
          superLight: 'rgb(252, 255, 244)',
          light: 'rgb(244, 252, 223)',
          DEFAULT: '#3c6d16',
          dark: '#2c510f',
          leaf: '#afdc34'
        },
        mainColor: {
          superLight: '#f7f9ff',
          light: '#d0daf5',
          DEFAULT: '#3961ce',
          dark: '#3961ce',
          superDark: '#1f3573',
          leaf: '#f21e27'
        },

        // old
        // mainColor: {
        //   superLight: '#f9f6ee',
        //   light: '#f7f2cd',
        //   DEFAULT: '#ffde16',
        //   dark: '#c09c0f',
        //   superDark: '#735d09',
        //   leaf: '#fff49e'
        // },

        customRed: {
          superLight: '#ffd6d6',
          light: '#ffa1a1',
          DEFAULT: '#ff4d4d',
          darker: '#e04646',
          dark: '#470000',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in forwards',
        fadeOut: 'fadeOut 1s ease-out forwards',
      },
      boxShadow: {
        popup: "#3961ce 0 3px 0, #3961ce 3px 0px 0, #3961ce 3px 3px 0, rgba(0, 0, 0, 0.432) 3px 3px 3px",
      },
      screens: {
        xs: "420px",
        xss: "320px",
        '3xl': "1670px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    function ({ addBase, theme }) {
      addBase({
        ':root': {
          /* Custom Brown */
          '--custom-brown-light': theme('colors.customBrown.light'),
          '--custom-brown': theme('colors.customBrown.DEFAULT'),
          '--custom-brown-dark': theme('colors.customBrown.dark'),

          /* Custom Green */
          '--custom-green-super-light': theme('colors.customGreen.superLight'),
          '--custom-green-light': theme('colors.customGreen.light'),
          '--custom-green': theme('colors.customGreen.DEFAULT'),
          '--custom-green-dark': theme('colors.customGreen.dark'),
          '--custom-green-leaf': theme('colors.customGreen.leaf'),

          /* Main Color */
          '--main-color-super-light': theme('colors.mainColor.superLight'),
          '--main-color-light': theme('colors.mainColor.light'),
          '--main-color': theme('colors.mainColor.DEFAULT'),
          '--main-color-dark': theme('colors.mainColor.dark'),
          '--main-color-super-dark': theme('colors.mainColor.superDark'),
          '--main-color-leaf': theme('colors.mainColor.leaf'),

          /* Custom Red */
          '--custom-red-super-light': theme('colors.customRed.superLight'),
          '--custom-red-light': theme('colors.customRed.light'),
          '--custom-red': theme('colors.customRed.DEFAULT'),
          '--custom-red-darker': theme('colors.customRed.darker'),
          '--custom-red-dark': theme('colors.customRed.dark'),
        },
      });
    },
  ],
};
