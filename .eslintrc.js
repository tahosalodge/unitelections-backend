  module.exports = {
    parser: "babel-eslint",
    extends: ["airbnb-base", "plugin:prettier/recommended"],
    env: {
        node: true,
    },
    rules: {},
    settings: {
      'import/resolver': {
        node: {
          moduleDirectory: ['src/', 'node_modules/'],
        },
      },
    },
  };
