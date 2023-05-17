<template>
  <section class="container">
    <div class="tags has-addons">
      <span class="tag">Limit</span>
      <span class="tag"><input type="text" v-model="first"/></span>
      <span class="tag">Page</span>
      <span class="tag"><input type="text" v-model="page"/></span>
    </div>
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <th></th>
        <th>ID</th>
        <th>Email</th>
        <th>Role</th>
        <th>Created At</th>
        <th>Updated At</th>
        <th>{{totalCount}} Users</th>
      </thead>
    </table><br/>
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <th></th>
        <th>ID</th>
        <th>Email</th>
        <th>Role</th>
        <th>Created At</th>
        <th>Updated At</th>
        <th>Edit</th>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users">
          <td><input type="checkbox"></input></td>
          <td v-html="user.id"></td>
          <td v-html="user.email"></td>
          <td v-html="user.role"></td>
          <td v-html="user.created_at"></td>
          <td v-html="user.updated_at"></td>
          <td><button>...</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>

export default {
  name: "admin",
  components: {
  },
  data(){
    return {
      first: 3,
      page: 1
    }
  },
  watch: {
    page: function(n,o){
      console.log("Page Change", n)
      this.fetchUsers();
    }
  },
  computed: {
    totalCount () {
      return this.$store.state.current_user.totalCount;
    },
    users () {
      return this.$store.state.current_user.users;
    }
  },
  // serverPrefetch () {
  //   return this.fetchUsers()
  // },
  async mounted () {
    if (this.users.length > 0) {
      await this.fetchUsers()
    }
  },
  methods: {
    offset() {
      console.log("offset", this.first, this.page)
      return this.first * this.page;
    },
    async fetchUsers() {
      await this.$store.dispatch("current_user/all", {params: { limit: this.limit, offset: this.offset() }})
    }
  }
};
</script>
