module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: ['airbnb', 'eslint:recommended', 'plugin:react/recommended'],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
            jsx: true
        },
        sourceType: 'module'
    },
    plugins: ['react', 'jsx-a11y', 'import'],
    rules: {
        'no-console': [1],
        indent: [
            'error',
            4,
            {
                SwitchCase: 1
            }
        ],
        'linebreak-style': 'off',
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],

        'react/jsx-indent-props': ['error', 4],
        'react/jsx-filename-extension': 0,
        'react/no-did-mount-set-state': 0,
        'react/display-name': 0,
        'react/jsx-indent': 0,
        'react/no-array-index-key': 0,
        'react/prefer-stateless-function': 0,
        'react/forbid-prop-types': 0,
        'react/jsx-one-expression-per-line': 0,
        'react/button-has-type': 0,
        'react/require-default-props': 0,
        'react/jsx-wrap-multilines': 0,

        'jsx-a11y/click-events-have-key-events': 0,
        'jsx-a11y/no-static-element-interactions': 0,
        'jsx-a11y/anchor-is-valid': 0
    }
};
