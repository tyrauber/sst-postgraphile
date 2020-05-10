import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import VueMeta from 'vue-meta'

import App from "@/App.vue";

import { createRouter } from '@/router'
import { createStore } from '@/store'

Vue.use(VueMeta, {
  refreshOnceOnNavigation: true
})

export const createApp = () => {

  const router = createRouter()
  const store = createStore()

  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })

  return { app, router, store, App }
}
