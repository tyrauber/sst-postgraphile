import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import SecureLS from "secure-ls";
import GraphQL from '../plugins/graphql'

import current_user from './current_user'

Vue.use(Vuex)

let plugins = [GraphQL]
let options = {
  modules: {
    current_user
  }
}
if (process.browser) {
  const ls = new SecureLS({ isCompression: false });

  plugins.push(createPersistedState({
    key: process.env.SESSION_KEY,
    paths: ['current_user'],
    //storage: window.localStorage,
    storage:{
      getItem: (key) => ls.get(key),
      setItem: (key, value) => ls.set(key, value),
      removeItem: (key) => ls.remove(key)
    }
  }))
}

options.plugins = plugins

export function createStore () {
  return new Vuex.Store(options)
}