const { transformSync } = require('@babel/core');

function locatorLoader(source) {
  const callback = this.async();
  const filePath = this.resourcePath;

  if (filePath.includes('node_modules') || filePath.includes('middleware.')) {
    callback(null, source);
    return;
  }

  try {
    const locatorPlugin = require('@locator/babel-jsx');
    const result = transformSync(source, {
      filename: filePath,
      sourceMaps: true,
      sourceFileName: filePath,
      babelrc: false,
      configFile: false,
      presets: [
        [
          '@babel/preset-typescript',
          {
            isTSX: true,
            allExtensions: true,
            onlyRemoveTypeImports: true,
          },
        ],
      ],
      plugins: [[locatorPlugin, this.getOptions()]],
      retainLines: false,
      compact: false,
    });

    if (!result?.code) {
      callback(null, source);
      return;
    }

    callback(null, result.code, result.map || undefined);
  } catch (error) {
    console.warn(
      `[@nbr/locator-webpack-loader] Failed to transform ${filePath}:`,
      error instanceof Error ? error.message : String(error),
    );
    callback(null, source);
  }
}

module.exports = locatorLoader;
