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
      <h2>AWS (Amazon Web Services) S3 Bucket</h2>
      <div class="field">
        <p class="control">
          <input class="input" type="password" placeholder="AWS Access Key ID" v-model="aws_access_key_id">
        </p>
      </div>
      <div class="field">
        <p class="control">
          <input class="input" type="password" placeholder="AWS Secret Access Key" v-model="aws_secret_access_key">
        </p>
      </div>
      <div class="field">
        <p class="control">
          <input class="input" type="text" placeholder="AWS Bucket Name" v-model="aws_bucket_name">
        </p>
      </div>
      <div class="field">
        <p class="control">
          <input class="input" type="tet" placeholder="AWS Region" v-model="aws_region_name">
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
      aws_access_key_id: '',
      aws_secret_access_key: '',
      aws_bucket_name: '',
      aws_region_name: ''
    }
  },
  beforeMount: function() {
    console.log(this.$store.state.current_user)
    this.id = this.$store.state.current_user.id
    this.email = this.$store.state.current_user.email
    this.aws_bucket_name = this.$store.state.current_user.aws_bucket_name
    this.aws_region_name = this.$store.state.current_user.aws_region_name

  },
  methods: {

    async updateAccount() {
      let attributes = { email: this.email }
      if((this.password) && (this.password == this.passwordConfirmation)){
        attributes.password = this.password
      }
      if(this.aws_access_key_id && this.aws_secret_access_key && this.aws_bucket_name && this.aws_region_name){
        attributes.aws_access_key_id  = this.aws_access_key_id
        attributes.aws_secret_access_key  = this.aws_secret_access_key
        attributes.aws_bucket_name  = this.aws_bucket_name
        attributes.aws_region_name  = this.aws_region_name
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