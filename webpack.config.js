const webpack = require("webpack");
const path = require("path");

const createElectronReloadWebpackPlugin = require("electron-reload-webpack-plugin");

const ElectronReloadWebpackPlugin = createElectronReloadWebpackPlugin({
  path: "./",
});

const { TypedCssModulesPlugin } = require("typed-css-modules-webpack-plugin");

const main = {
  mode: "development",
  target: "electron-main",
  entry: path.join(__dirname, "src", "index"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /.ts?$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "ts-loader",
      },
      { test: /\.node$/, loader: "node-loader" },
      {
        test: /.(html|png)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "pages/[folder]/[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  plugins: [ElectronReloadWebpackPlugin()],
  devtool: "inline-source-map",
};

const renderer = {
  mode: "development",
  target: "electron-renderer",
  entry: {
    "index/index": path.join(__dirname, "src", "pages", "index", "index.tsx"),
  },
  output: {
    path: path.resolve(__dirname, "dist", "pages"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".json", ".js", ".jsx", ".css", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts)$/,
        use: ["ts-loader"],
        include: [path.resolve(__dirname, "src"), path.resolve(__dirname, "node_modules")],
      },
      { test: /\.node$/, loader: "node-loader" },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader?modules"],
      },
    ],
  },
  plugins: [
    ElectronReloadWebpackPlugin(),
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new TypedCssModulesPlugin({
      globPattern: "src/pages/**/*.css",
    }),
  ],
  devtool: "inline-source-map",
};

module.exports = [main, renderer];
