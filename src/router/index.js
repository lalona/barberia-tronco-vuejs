import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/appointment',
    name: 'AppointmentSteps',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/appointments/AppointmentSteps.vue')
  },
  {
    path: '/appointmentInfo',
    name: 'AppointmentInfo',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/appointments/Appointment.vue')
  },
  {
    path: '/appointmentAddress/:idClient',
    name: 'AppointmentAddress',
    props: true,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/appointments/AppointmentAddress.vue')
  },
  {
    path: '/appointmentAvailability/:clientAddressId',
    name: 'AppointmentAvailability',
    props: true,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/appointments/AppointmentAvailability.vue')
  },
  {
    path: '/appointmentServices',
    name: 'AppointmentServices',    
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/appointments/AppointmentServices.vue')
  },
  {
    path: '/appointmentConfirmation/:appointmentId',
    name: 'AppointmentConfirmation',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/appointments/AppointmentConfirmation.vue')
  }
  

]

const router = new VueRouter({  
  routes
})

export default router
