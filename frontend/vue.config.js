module.exports = {
  configureWebpack: {
    performance: {
      hints: false
    },
    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 10000,
        maxSize: 250000
      }
    }
  },
  devServer: {

    proxy: {
      ...['/api'].reduce(
        (acc, ctx) => ({
          ...acc,
          [ctx]: {
            target: process.env.VUE_APP_API_ROOT,
            changeOrigin: true,
            ws: false
          }
        }),
        {}
      ),
    }
  },
  transpileDependencies: ['vuetify'],
  publicPath: '/'
};
