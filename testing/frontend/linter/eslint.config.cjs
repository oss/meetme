module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [],
    overrides: [],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["react"],
    rules: {
        "semi": ["error", "always"],
        "for-direction": "error",
        "no-compare-neg-zero": "error",
        "no-cond-assign": ["error", "always"],
        "camelcase": [
            "error",
            {
                "properties": "always",
            },
        ],
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "no-const-assign": ["error"],
        "no-dupe-class-members": ["error"],
        "no-dupe-else-if": ["error"],
        "no-dupe-keys": ["error"],
        "no-duplicate-case": ["error"],
        "no-duplicate-imports": ["error"],
        "jsx-quotes": ["error", "prefer-double"],
        "no-ex-assign": ["error"],
    },
};
