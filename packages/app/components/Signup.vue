<template>
  <form id="join" @submit.prevent>
    <div class="notification is-danger" v-if="error">
      <button class="delete" @click="error = null"></button>
      <p v-html="error"></p>
    </div>
		<div class="field">
		  <p class="control has-icons-left has-icons-right">
		    <input class="input" type="email" placeholder="Email" v-model="email">
		    <span class="icon is-small is-left">
		      <i class="fa fa-envelope"></i>
		    </span>
		    <span class="icon is-small is-right">
		      <i class="fa fa-check"></i>
		    </span>
		  </p>
		</div>
		<div class="field">
		  <p class="control has-icons-left">
		    <input class="input" type="password" placeholder="Password" v-model="password">
		    <span class="icon is-small is-left">
		      <i class="fa fa-lock"></i>
		    </span>
		  </p>
		</div>
		<div class="field">
		  <p class="control">
		    <button class="button is-success" @click="submit">
		      Join
		    </button>
		  </p>
		</div>
  </form>
</template>

<script>

export default {
  data() {
    return {
      email: '',
      password: '',
      error: null
    }
  },
  mounted(){
  	if(this.$store.getters['current_user/jwt_token']){
  		this.$router.push('/')
  	}
  },
  methods: {
    async submit() { 
      await this.$store.dispatch("current_user/signup", {
        email: this.email, password: this.password
      }).then(response => {
        this.$router.push("/")
      }).catch(err => {
        if(err.includes('duplicate key value')){
          this.error = 'Invalid Credentials'
        }else{
          this.error = err
        }
      })
    }
  }
}
</script>