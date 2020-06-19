module.exports = {
  configureWebpack: {
    performance: {
      hints: false
    },
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000
      }
    }
  },
  devServer: {
    port:8081,
    proxy: {
      ...['/api'].reduce(
        (acc, ctx) => ({
          ...acc,
          [ctx]: {
            target: 'http://localhost:8080',
            changeOrigin: true,
            ws: true
          }
        }),
        {}
      ),
    }
  },
  transpileDependencies: ['vuetify'],
  publicPath: '/'
};
