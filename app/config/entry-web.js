import { createApp } from "./bootstrap";
const { app, store, router } = createApp()

let clientState = store.state

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

// router.beforeEach((to,from, next) => {
//   if(to.meta.requiresAdmin){
//     if(!store.state.current_user.role != 'admin'){
//       next("/")
//     } else {
//       next();
//     }
//   }
// })
  
app.$mount('#app')

store.replaceState(Object.assign(store.state, clientState))
