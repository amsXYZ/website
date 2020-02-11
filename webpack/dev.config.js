const merge = require("webpack-merge");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const commonConfig = require("./common.config");

const projects = require("../src/projectsData.json");

const config = merge(commonConfig, {
  mode: "development",
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  devtool: "source-map",
  devServer: {
    contentBase: "./dist"
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "../src/resources"),
        to: "resources",
        toType: "dir"
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "../src/404.html"),
        to: "404.html"
      }
    ]),
    new HtmlWebpackPlugin({
      title: "[DEV] - AMS - Freelance Software Engineer",
      filename: "index.html",
      template: "./src/index.html",
      chunks: ["main"]
    })
  ]
});
for (const project of projects.data) {
  config.plugins.push(
    new HtmlWebpackPlugin({
      title: `[DEV] - AMS - ${project.title}`,
      filename: `projects/${project.page}.html`,
      template: "./src/project.html",
      chunks: ["project"]
    })
  );
}

module.exports = config;
