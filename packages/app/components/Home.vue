<template>
  <div class="home">
    <section class="hero is-medium is-primary is-bold">
      <div class="hero-body">
        <div class="container has-text-centered">
          <img src="~@/assets/images/postgraphile.png" width="200" />
          <h1 class="title">
            Full-stack<small>1</small> GraphQL<small>2</small> PWA<small>3</small> with SSR<small>4</small>, HMR<small>5</small> and CSH<small>6</small>.
          </h1>
          <h2 class="subtitle">
            Built with Vue.js, Koa.js, Webpack and Postgraphile.
          </h2>
          <p>
            <small>1</small> Front-end and back-end internet application<br/>
            <small>2</small> An open-source data query and manipulation language for APIs.<br/>
            <small>3</small> Progressive Web Application<br/>
            <small>4</small> Server Side Rendering<br/>
            <small>5</small> Hot Model Reload<br/>
            <small>6</small> Client Side Hydration<br/>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>

export default {
  name: "home",
  components: {
    
  },
  // mounted(){
  //   console.log(this.$store.state.current_user.jwt_token)
  // }
};
</script>
