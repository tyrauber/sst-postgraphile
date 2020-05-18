const fs = require('fs');
const yaml = require('js-yaml');

try {
  let fileContents = fs.readFileSync('./settings.yml', 'utf8');
  let data = yaml.safeLoad(fileContents);
  Object.assign(process.env, data.stages[process.env.STAGE].environment)
} catch (e) {
  console.log(e);
}

const server = require('./server');

const { PORT = 3000 } = process.env;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

module.exports = server;