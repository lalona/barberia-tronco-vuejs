import Vue from 'vue'
import App from './App.vue'
import './assets/index.css';
import router from './router'
import { ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import VueMeta from 'vue-meta';
//import Vuetify from './plugins/vuetify.js'
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import Vuex from 'vuex';
import '@mdi/font/css/materialdesignicons.css';

Vue.config.productionTip = false

extend('required', {
  ...required,
  message: 'This field is required'
});

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
});

Vue.use(Vuetify);

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})

new Vue({
  router,
  ValidationProvider,  
  vuetify : new Vuetify(),
  render: h => h(App),
  store: store,
}).$mount('#app')
