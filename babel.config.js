const presets = [
  [
    '@babel/env',
    {
      targets: {
        firefox: '57',
        chrome: '60',
      },
      useBuiltIns: 'entry',
    },
  ],
  '@babel/react',
];

const plugins = [];

module.exports = { presets, plugins };
