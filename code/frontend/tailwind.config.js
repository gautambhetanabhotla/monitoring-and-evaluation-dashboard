import typography from "@tailwindcss/typography";
import { heroui } from "@heroui/react";

export default {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
        './node_modules/.vite/**/@heroui*.js'
    ],
    theme: {
        extend: {}
    },
    darkMode: "class",
    plugins: [
        typography(),
        heroui(),
    ],
};