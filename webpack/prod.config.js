const merge = require("webpack-merge");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const commonConfig = require("./common.config");

const config = merge(commonConfig, {
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "../src/resources"),
        to: "resources",
        toType: "dir"
      }
    ]),
    new HtmlWebpackPlugin({
      title: "AMS",
      template: "./src/index.html"
    })
  ]
});

module.exports = config;
