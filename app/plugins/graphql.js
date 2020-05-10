//require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch'

const Graphql = store => {

  store.subscribe((mutation, state) => {
  })

  store.subscribeAction((action, state) => {
  })

  store.graphql = async (query, success, failure) => {

    let headers = { 'Content-Type': 'application/json' }
    let token = store.getters['current_user/jwt_token'];
    if(token){
      headers['AUTHORIZATION'] = `BEARER ${token}`;
    }
    let path = `${process.env.HOST}/${process.env.STAGE}/graphql`
    console.log("fetch", path, query, token)
    return await fetch(path, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({"query": query.query, "variables": query.variables||{}}),
    })

    .then(res => {
      return res.json();
    })

    .then(res => {
      if(res.errors){
        if(failure)
          failure(res)
        throw res.errors.map(e => e.message ).join(",")
      }
      if(success){
        success(res);
      }
      return res
    })
  }
}

export default Graphql;