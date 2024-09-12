const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
// module.exports = {
//   configureWebpack: {
//     resolve: {
//       alias: {
//         vue$: 'vue/dist/vue.esm-bundler.js'
//       }
//     },
//     define: {
//       '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': true, // or false, based on your needs
//       // other flags can be added here if needed
//     },
//   },
// };

