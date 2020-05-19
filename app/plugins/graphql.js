//require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch'

const HOST = () => {
  return !!(typeof window !== 'undefined') ? window.location.origin : process.env.HOST
}

const Graphql = store => {

  store.subscribe((mutation, state) => {
  })

  store.subscribeAction((action, state) => {
  })
  store.fetch = async (method='get', path='/', payload={}, success, failure) => {
    let headers = { 'Content-Type': 'application/json' }
    let token = store.getters['current_user/jwt_token'];
    if(token){
      headers['AUTHORIZATION'] = `BEARER ${token}`;
    }
    path = `${HOST()}${path}`
    //console.log("fetch", method, path, payload, token)
    return await fetch(path, {
      method: method,
      headers: headers,
      body: JSON.stringify(payload),
    })
    .then(res => {
      //console.log("Res", res)
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
  store.graphql = async (query, success, failure) => {

    let headers = { 'Content-Type': 'application/json' }
    let token = store.getters['current_user/jwt_token'];
    if(token){
      headers['AUTHORIZATION'] = `BEARER ${token}`;
    }
    let path = `${HOST()}/graphql`
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