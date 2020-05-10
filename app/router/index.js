import Vue from 'vue'
import Router from 'vue-router'
import { createStore } from '@/store'
const store = createStore()

Vue.use(Router)

import Home from "@/components/Home.vue";
import Admin from "@/components/Admin.vue";

const checkAdminRights = (to, from, next) => {
  console.log('checkAdminRights', store.state.user)
  //next({ path: to.path });      
}

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    meta: { requiresAdmin: true }
  },
  {
    path: "/signup",
    name: "Signup",
    component: () =>
      import("@/components/Signup.vue")
  },
  {
    path: "/signin",
    name: "Signin",
    component: () =>
      import("@/components/Signin.vue")
  },
  {
    path: "/settings",
    name: "Settings",
    component: () =>
      import("@/components/Settings.vue")
  },
  {
    path: "*",
    name: "404",
    component: () =>
      import("@/components/404.vue")
  }
];

export function createRouter () {
  return new Router({
    mode: 'history',
    routes: routes
  })
}