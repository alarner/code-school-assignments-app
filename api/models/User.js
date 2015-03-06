var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true },
    email     : { type: 'email',  unique: true },
    type	  : { type: 'integer', required: true, defaultsTo: 1},
    passports : { collection: 'Passport', via: 'user' }
  }
};

module.exports = User;
