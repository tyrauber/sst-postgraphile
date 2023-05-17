const path = require('path')

let config = {
  schema: 'app',
  default_role: 'guest',
  jwt_identifier: 'app.jwt_token',
  client: 'postgresql',
  watchPg: false,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'migrations',
    directory: path.join(__dirname, './db/migrations')
  },
  seeds: {
    directory: path.join(__dirname, './db/seeds')
  },
}

config = Object.assign(config, { 
  app_secret: process.env.APP_SECRET || 'SUPER_SECRET_APPLICATION_ENCRYPTION_KEY' 
})

module.exports = {
  development: Object.assign({...config}, { 
    watchPg: false,
    connection: {
      database: 'sls_development',
      user:     'postgres',
      password: 'postgres'
    }
  }),
  test: Object.assign({...config}, { 
    connection: {
      database: 'sls_test',
      user:     'postgres',
      password: 'postgres'
    }
  }),
  production: Object.assign({...config}, {
    connection: process.env.DATABASE_URL
  })
}