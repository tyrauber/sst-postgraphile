const args = process.argv.slice(2);
import fetch from 'node-fetch';

const log = (data) => {
  console.log(JSON.stringify(data, null, 2))
}
const request = async (opts) => {
  const startAt = Date.now();
  opts = Object.assign({host:'', query:'', params:{}, token: null}, opts);
  let headers = {
    'Content-Type': 'application/json'
  }
  if(opts.token){
    headers = Object.assign(headers, {'Authorization': (opts?.token ? `Bearer ${opts.token}` : null) })
  }
  return fetch(opts.host, {
    method: 'POST', headers,
    body: JSON.stringify({query: opts.query, variables: opts.variables }),
  })
    .then((res) => res.json())
    .then((result) => {
      result.elapsedTime = Date.now() - startAt;
      return result;
    });
}

const main = async() => {
  let token;
  const now = Date.now();
  const signup = await request({
    host: args[0], 
    query: `mutation userSignup($input: SignupInput!) { signup(input: $input) { jwtToken } }`, 
    variables: { input: { email:  `email+${now}@example.com`, password: 'password' } }
  })
  log({ signup })
  token = signup.data?.signup?.jwtToken;

  const signin = await request({
    host: args[0], 
    query: `mutation userSignin($input: SigninInput!) { signin(input: $input) { jwtToken } }`, 
    variables: { input: { email:  `email+${now}@example.com`, password: 'password' } }
  })
  log({ signin })
  token = signin.data?.signin?.jwtToken;

  if(token){
    const whoami = await request({
      host: args[0], 
      query: `query whoAmI {me {id email role}}`, 
      variables: { },
      token
    })
    log({whoami})
  }
}

if(args[0]){
  main();
}


