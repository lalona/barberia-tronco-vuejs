import Vue from 'vue'
import App from './App.vue'
import './assets/index.css';
import router from './router'
import { ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

Vue.config.productionTip = false

extend('required', {
  ...required,
  message: 'This field is required'
});

new Vue({
  router,
  ValidationProvider,
  render: h => h(App)
}).$mount('#app')
