'use strict';

const config = require('../config/index');

const roles = {
  User: {
    //Help functions created in auth module: isValidGMPUserToken, isValidGMPUser
    GMP: config.get('server:penRequest:rolesAllowed'),
    //Help functions created in auth module: isValidUMPUserToken, isValidUMPUser
    UMP: config.get('server:studentRequest:rolesAllowed'),
    //Help functions created in auth module: isValidStudentSearchUserToken, isValidStudentSearchUser
    StudentSearch: [config.get('server:studentSearch:roleAdmin')],
    //Help functions created in auth module: isValidPenRequestBatchUserToken, isValidPenRequestBatchUser
    PenRequestBatch: [config.get('server:penRequestBatch:roleAdmin')]
  },
  Admin: {
    //Help functions created in auth module: isValidGMPAdmin
    GMP: config.get('server:penRequest:roleAdmin'),
    //Help functions created in auth module: isValidUMPAdmin
    UMP: config.get('server:studentRequest:roleAdmin'),
    //Help functions created in auth module: isValidStudentSearchAdmin
    StudentSearch: config.get('server:studentSearch:roleAdmin'),
    //Help functions created in auth module: isValidPenRequestBatchAdmin
    PenRequestBatch: config.get('server:penRequestBatch:roleAdmin')
  }
}

module.exports = roles;