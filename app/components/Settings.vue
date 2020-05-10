<template>
	<div id="page">
		 <form id="join" @submit.prevent autocomplete="off">
		 	<h2>Account Details</h2>
			<div class="field">
			  <p class="control has-icons-left has-icons-right">
			    <input class="input" type="email" placeholder="Email" v-model="email" autocomplete="off">
			    <span class="icon is-small is-left">
			      <i class="fa fa-envelope"></i>
			    </span>
			    <span class="icon is-small is-right">
			      <i class="fa fa-check"></i>
			    </span>
			  </p>
			</div>
			<hr/>
			<h2>Change Password</h2>
			<div class="field">
			  <p class="control">
			    <input class="input" type="password" placeholder="Password" v-model="password" autocomplete="new-password">
			  </p>
			</div>
			<div class="field">
			  <p class="control">
			    <input class="input" type="password" placeholder="Password Confirmation" v-model="passwordConfirmation" autocomplete="new-password">
			  </p>
			</div>

			<div class="field">
			  <p class="control">
			    <button class="button  is-fullwidth is-success" @click="updateAccount">
			      Update
			    </button>
			  </p>
			</div>

	    <hr/>
	    <a class="button is-fullwidth" @click="deleteAccount">Delete Account</a>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      email: '',
    	password: '',
    	passwordConfirmation: '',
    }
  },
  beforeMount: function() {
    this.id = this.$store.state.current_user.id
    this.email = this.$store.state.current_user.email

  },
  methods: {

    async updateAccount() {
      let attributes = { email: this.email }
      if((this.password) && (this.password == this.passwordConfirmation)){
        attributes.password = this.password
      }
      await this.$store.dispatch("current_user/update", { id: this.id, attributes })
    },

  	async deleteAccount() {
	   if(confirm("This action is irreversible. Are you sure you want to proceed?")){
	  		await this.$store.dispatch("current_user/delete", { id: this.id }).then(response => {
          this.$router.push("/")
        })
      }
	  }
  }
}
</script>