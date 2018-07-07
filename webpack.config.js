// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const webpack = require("webpack");
const { CheckerPlugin } = require("awesome-typescript-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const path = require("path");
const helpers = require("./config/helpers");
const history = require("connect-history-api-fallback");
const convert = require("koa-connect");
const webpackServeWaitpage = require("webpack-serve-waitpage");

module.exports = (env, argv) => {
  return {
    mode: argv.mode === "production" ? "production" : "development",
    entry: {
      polyfills: "./src/polyfills.ts",
      app: "./src/main.ts"
    },

    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
      extensions: [".ts", ".js"]
    },

    // Source maps support ('inline-source-map' also works)
    devtool: argv.mode === "production" ? false : "source-map",

    serve: {
      port: 3000,
      open: true,
      add: (app, middleware, options) => {
        app.use(webpackServeWaitpage(options));
        app.use(convert(history({})));
      }
    },

    // Add the loader for .ts files.
    module: {
      rules: [
        {
          test: /\.ts$/,
          enforce: "pre",
          loader: "tslint-loader",
          options: {
            emitErrors: true,
            failOnHint: true,
            formatter: "stylish"
          }
        },
        {
          test: /\.tsx?$/,
          loaders: ["awesome-typescript-loader", "angular2-template-loader"]
        },
        {
          test: /\.html$/,
          loader: "html-loader"
        },
        {
          test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
          loader: "file-loader?name=assets/[name].[hash].[ext]"
        },
        {
          test: /\.scss$/,
          use: [
            // fallback to style-loader in development
            process.env.NODE_ENV !== "production"
              ? "style-loader"
              : MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader"
          ]
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"]
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        jQuery: "jquery",
        $: "jquery",
        jquery: "jquery"
      }),
      new CleanWebpackPlugin(["dist"]),
      new FaviconsWebpackPlugin("./src/favicon.png"),
      // Workaround for angular/angular#11580
      new webpack.ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)@angular/,
        helpers.root("./src"), // location of your src
        {} // a map of your routes
      ),
      new CheckerPlugin(),
      new HtmlWebpackPlugin({
        template: "src/index.html"
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      })
    ],

    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all"
          }
        }
      }
    },

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[hash].js",
      chunkFilename: "[id].[hash].chunk.js"
    }
  };
};
