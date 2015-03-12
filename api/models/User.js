var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true },
    firstName  : { type: 'string', required: true },
    lastName  : { type: 'string', required: true },
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
