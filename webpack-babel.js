import path from 'path';
import webpack from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import UnusedFilesWebpackPlugin from 'unused-files-webpack-plugin2';

const imageLoader = 'file-loader?name=img/[name]-[sha512:hash:base64:7].[ext]';
const fontLoader = 'file-loader?name=fnt/[name]-[sha512:hash:base64:7].[ext]';

function getCssOptions(target) {
  if (target !== 'build') {
    return `css-loader?${JSON.stringify({
      modules: false,
      minimize: false,
      sourceMap: true,
    })}`;
  }

  return `css-loader?${JSON.stringify({
    modules: false,
    minimize: true,
    sourceMap: true,
    discardComments: {
      removeAll: true,
    },
  })}`;
}

function css(target) {
  const extractCSS = new ExtractTextPlugin('style/[name]-[contenthash].css');
  const cssOptions = getCssOptions(target);
  function cssLoaderConf(loader) {
    return extractCSS.extract({
      fallbackLoader: 'style-loader',
      loader: `${cssOptions}${loader}`,
    });
  }

  const cssLoader = cssLoaderConf('');
  const lessLoader = cssLoaderConf('!less-loader?sourceMap');
  const scssLoader = cssLoaderConf('!sass-loader?sourceMap');

  return {
    plugin: extractCSS,
    loaders: [
      { test: /\.css$/, loader: cssLoader },
      { test: /\.less$/, loader: lessLoader },
      { test: /\.scss$/, loader: scssLoader },
    ],
  };
}

const outputPath = 'dist/';
const dirname = __dirname;
const cssConfig = css('build');

export default {
  entry: './src/browser',
  output: {
    path: path.join(dirname, outputPath),
    filename: '[name]-[chunkhash].bundle.js',
    sourceMapFilename: 'source-maps/[file].map',
  },
  devtool: '#source-maps',
  devServer: {
    inline: true,
  },
  module: {
    loaders: [
      {
        test: /\.(js|es)$/,
        exclude: /node_modules|bower_components/,
        loader: 'babel-loader',
        query: JSON.stringify({
          babelrc: false,
          cacheDirectory: true,
          presets: [
            [
              'env', {
                modules: false,
                targets: { chrome: 55, firefox: 50 },
              },
            ],
          ],
          plugins: ['transform-runtime'],
          env: {
            test: {
              plugins: ['istanbul'],
            },
          },
        }),
      },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.woff2?(\?[^/]*)?$/,
        loader: fontLoader,
      },
      {
        test: /\.ttf(\?[^/]*)?$/,
        loader: fontLoader,
      },
      {
        test: /\.eot(\?[^/]*)?$/,
        loader: fontLoader,
      },
      {
        test: /\.svg(\?[^/]*)?$/,
        loader: fontLoader,
      },
      {
        include: require.resolve('bootstrap/js/collapse'),
        loader: 'imports-loader?jQuery=jquery',
      },
      {
        include: require.resolve('bootstrap/js/modal'),
        loader: 'imports-loader?jQuery=jquery',
      },
      {
        include: require.resolve('bootstrap/js/tooltip'),
        loader: 'imports-loader?jQuery=jquery',
      },
      {
        include: require.resolve('bootstrap/js/popover'),
        loader: 'imports-loader?jQuery=jquery',
      },
      { test: /\.(png|jpg|jpeg|gif|ico)$/, loader: imageLoader },
    ].concat(cssConfig.loaders),
  },
  plugins: [
    cssConfig.plugin,
    new HtmlWebpackPlugin({
      template: './src/html/index.html',
      filename: 'index.html',
      compileTime: new Date().toISOString(),
    }),
    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery',
    }),
    new webpack.DefinePlugin({
      COMPILE_TIME: JSON.stringify(new Date()),
    }),
    new UnusedFilesWebpackPlugin({
      failOnUnused: true,
      pattern: 'src/**/*.*',
    }),
  ],
};
