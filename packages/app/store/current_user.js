import Vue from 'vue'
import UserSignup from '#/api/users/post_signup.gql'
import UserSignin from '#/api/users/post_signin.gql'
import UserMe from '#/api/users/get_me.gql'
import UserUpdate from '#/api/users/_id/patch.gql'
import UserDestroy from '#/api/users/_id/delete.gql'

const format = (query, variables) =>{
  return {
    query: query.loc.source.body,
    variables: {
      input: variables
    }
  }
}


export default {
  namespaced: 'current_user',
  state: () => ({
    id: null,
    email: null,
    role: null,
    aws_bucket_name: null,
    aws_region_name: null,
    jwt_token: null,
    users: [],
    totalCount: 0,
    pageInfo: {}
  }),
  getters: {
    jwt_token: (state) =>{
      return state.jwt_token;
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
        console.log("update", key, options[key])
        Vue.set(state, key, options[key])
      }
    },
  },

  actions: {
    async upload ({ commit, getters }, {params}) {
      return await this.fetch('POST', '/api/upload', params,
        (res) => {
          return res.url;
        }
      );
    },


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
      return await this.graphql(format(UserMe, {}),
        (res) =>{
          return commit('update', res.data.me);
        }
      );
    },

    async signin ({ commit, dispatch, getters }, { email, password }) {
      return await this.graphql(format(UserSignin, { email: email, password: password }),
        (res) =>{
          commit('update', { jwt_token: res.data.signin.jwt_token });
          return dispatch('me')
        },
        (res) => {}
      );
    },

    async signup ({ commit, dispatch, getters}, { email, password }) {
      return await this.graphql(format(UserSignup, { email: email, password: password }),
        (res) =>{
          commit('update', {jwt_token: res.data.signup.jwt_token });
          return dispatch('me')
        },
      )
    },

    async update ({ commit, getters }, { id, attributes = {} }) {
      return await this.graphql(format(UserUpdate, { id: id, patch: attributes }),
        (res) =>{
          commit('update', res.data.update_user.user);
        }
      )
    },

    async delete({ commit, dispatch, getters }, { id }) {
      return await this.graphql(format(UserDestroy, { id: id }),
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


