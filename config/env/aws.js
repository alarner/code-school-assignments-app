module.exports = {
  connections: {
    postgres: {
      adapter: 'sails-postgresql',
      host: 'localhost',
      user: 'postgres',
      password: 'postgres',
      database: 'appdb'
    }

  },

  models: {
    migrate: 'safe'
  }
};