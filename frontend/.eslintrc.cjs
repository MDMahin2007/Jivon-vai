module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: ["eslint:recommended"],
    plugins: ["react"],
    settings: {
        react: {
            version: "detect",
        },
    },
    ignorePatterns: ["dist/**"],
    rules: {
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
    },
};