var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true },
    name  : { type: 'string', required: false },
    avatar  : { type: 'string', required: false },
    email     : { type: 'email',  unique: true },
    type	  : { type: 'integer', required: true, defaultsTo: 1},
    passports : { collection: 'Passport', via: 'user' },
    submissions: { collection: 'Submission', via: 'user' },
    deletedAt: {
      type: 'datetime',
      required: false
    }
  }
};

module.exports = User;
