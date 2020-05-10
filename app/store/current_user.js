import Vue from 'vue'

export default {
  namespaced: 'current_user',
  state: () => ({
    id: null,
    email: null,
    role: null,
    jwt_token: null,
    users: [],
    totalCount: 0,
    pageInfo: {}
  }),
  getters: {
    jwt_token: (state) =>{
      return state.jwt_token;
    },
    signin: () => {
      return  (attributes) => {
        return { query: `mutation signin($input: SigninInput!) {
          signin(input: $input) {
            jwt_token
          }}`, variables: { input: attributes }
        }
      }
    },
    signup: () => {
      return (attributes) => { 
        return { query: `mutation signup($input: SignupInput!) {
          signup(input: $input) {
            jwt_token
          }}`, variables: { input: attributes }
        }
      }
    },
    me: () => {
      return {query: `{ me { id email role } }`}
    },
    update: () => {
      return (id, attributes) => {
        return { query: `mutation update_user($input: UpdateUserInput!) {
          update_user(input: $input) {
            user {email, role}
          }}`, variables: { input: { id: id, patch: attributes } }
        }
      }
    },
    delete: () => {
      return (id) => {
        return { query: `mutation delete_user($input: DeleteUserInput!) {
          delete_user(input: $input) {
            user { id }
          }}`, variables: {input: { id: id } }
        }
      }
    },
    all: () => {
      return (params) => {
        console.log(params)
        let atts = { first: 3, offset: 0 }
        atts = Object.assign(atts, params)
        return { query: 
          `query findusers($first: Int, $last: Int, $offset: Int, $orderBy: [UsersOrderBy!]) {
            users(first: $first, last: $last, offset: $offset, orderBy: $orderBy) {
              nodes {
                id email role created_at updated_at
              }
              totalCount
              pageInfo {
                startCursor endCursor
              }
            }
          }`, variables: atts
        }
      }
    }
  },
  mutations: {
    update (state, options){
      //console.log("UPDATE", options, state)
      for (let key in options) { 
        Vue.set(state, key, options[key])
      }
    },
  },

  actions: {

    async all ({ commit, getters }, {params}) {
      console.log("action all", params)
      return await this.graphql(getters.all(params),
        (res) =>{
          return commit('update', { 
            totalCount: res.data.users.totalCount,
            pageInfo: res.data.users.pageInfo,
            users: res.data.users.nodes 
          });
        }
      );
    },

    async me ({ commit, getters }) {
      return await this.graphql(getters.me,
        (res) =>{
          return commit('update', res.data.me);
        }
      );
    },

    async signin ({ commit, dispatch, getters }, { email, password }) {
      return await this.graphql(getters.signin({email: email, password: password }), 
        (res) =>{
          commit('update', { jwt_token: res.data.signin.jwt_token });
          return dispatch('me')
        },
        (res) => {}
      );
    },

    async signup ({ commit, dispatch, getters}, { email, password }) {
      return await this.graphql(getters.signup({email: email, password: password }),
        (res) =>{
          commit('update', {jwt_token: res.data.signup.jwt_token });
          return dispatch('me')
        },
      )
    },

    async update ({ commit, getters }, { id, attributes = {} }) {
      return await this.graphql(getters.update(id, attributes),
        (res) =>{
          commit('update', res);
        }
      )
    },

    async delete({ commit, dispatch, getters }, { id }) {
      return await this.graphql(getters.delete(id),
        (res) =>{
          dispatch('signout')
        }
      )
    },

    async signout ({ commit }){
      commit("update", {
        id: null,
        email: null,
        role: null,
        jwt_token: null
      })
    }
  }
}


