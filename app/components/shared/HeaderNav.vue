<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link :to="{name: 'Home'}" class="navbar-item"><img src="~@/assets/images/postgraphile.png" height="64"></router-link>

      <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu">
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons  has-addons">
            <!-- <router-link :to="{name: 'Admin'}" v-if="loggedIn" class="button">Admin</router-link> -->
            <router-link :to="{name: 'Upload'}" v-if="loggedIn" class="button">Upload</router-link>
            <router-link :to="{name: 'Settings'}" v-if="loggedIn" class="button">Settings</router-link>
            <a @click="logout" v-if="loggedIn" class="button">Logout</a>
            <template v-else>
              <router-link :to="{name: 'Signin'}" class="button">Signin</router-link>
              <router-link :to="{name: 'Signup'}" class="button">Signup</router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
  export default {
    props: ['show-nav'],
    methods: {
      async logout() {
        this.$store.dispatch('current_user/signout')
        this.$router.push('/')
      }
    },
    computed: {
      loggedIn(){
        return !!(this.$store.getters['current_user/jwt_token'])
      }
    }
  }
</script>