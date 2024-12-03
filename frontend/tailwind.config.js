module.exports = {
    plugins: [
        require('@headlessui/tailwindcss')
    ],
    content: [
        './public/index.html',
        './components/**/*.{html,js,jsx,ts,tsx}',
        './pages/**/*.{html,js,jsx,ts,tsx}',
        './index.js',
        './main.js',
    ],
    safelist: ['bg-white', 'bg-red-300'],
    variants: {
        backgroundColor: ({ after }) => after(['disabled']),
    },
    theme: {
        extend: {
            colors: {
                'rutgers_red': '#cc0033',
                'rutgers_grey': '#5f6a72',
                'rutgers_black': '#000000',
            },
        },
    },
};
