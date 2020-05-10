<template>
  <div id="app">
    <header-nav></header-nav>
    <router-view />
  </div>
</template>

<script>
  import HeaderNav from '@/components/shared/HeaderNav'
  export default {
    components:{
      HeaderNav
    },
    metaInfo: {
      title: 'Home',
      titleTemplate: '%s | GraphQL Vue'
    }
  }
</script>

<style lang="scss">
@import 'assets/styles.scss';
</style>