'use strict';

const config = require('../config/index');

const roles = {
  User: {
    //Help functions created in auth module: isValidGMPUserToken, isValidGMPUser
    GMP: config.get('server:penRequest:rolesAllowed'),
    //Help functions created in auth module: isValidUMPUserToken, isValidUMPUser
    UMP: config.get('server:studentRequest:rolesAllowed'),
    //Help functions created in auth module: isValidStudentSearchUserToken, isValidStudentSearchUser
    StudentSearch: config.get('server:studentSearch:rolesAllowed'),
    //Help functions created in auth module: isValidPenRequestBatchUserToken, isValidPenRequestBatchUser
    PenRequestBatch: config.get('server:penRequestBatch:rolesAllowed'),
    //Help functions created in auth module: isValidStaffAdministrationUser
    StaffAdministration: config.get('server:administration:rolesAllowed'),
    NominalRoll: config.get('server:nominalRoll:rolesAllowed'),
    NominalRollReadOnly: ['NOMINAL_ROLL_READ_ONLY'],
    //Help functions created in auth module: isValidGUMPAnalyticsUser
    GUMPAnalytics: config.get('server:studentRequest:roleAnalytics'),
    //Help functions created in auth module: isValidPenRequestBatchAnalyticsUser
    PenRequestBatchAnalytics: config.get('server:penRequestBatch:roleAnalytics'),
    //Help functions created in auth module: isValidExchangeUserToken, isValidExchangeUser
    Exchange: ['SECURE_EXCHANGE'],
    //Help functions created in auth module: isValidPenTeamRoleUserToken, isValidPenTeamRoleUser
    PenTeamRole: config.get('server:edx:teamRoles:pen'),
    //Help functions created in auth module: isValidSchoolUserToken, isValidSchoolUser
    Institute: config.get('server:institute:rolesAllowed'),
  },
  Admin: {
    //Help functions created in auth module: isValidGMPAdmin
    GMP: config.get('server:penRequest:roleAdmin'),
    //Help functions created in auth module: isValidUMPAdmin
    UMP: config.get('server:studentRequest:roleAdmin'),
    //Help functions created in auth module: isValidStudentSearchAdmin
    StudentSearch: config.get('server:studentSearch:roleAdmin'),
    //Help functions created in auth module: isValidPenRequestBatchAdmin
    PenRequestBatch: config.get('server:penRequestBatch:roleAdmin'),
    //Help functions created in auth module: isValidStaffAdministrationAdmin
    StaffAdministration: config.get('server:administration:roleAdmin'),
    NominalRoll: config.get('server:nominalRoll:roleAdmin'),
    District: 'DISTRICT_ADMIN',
    SchoolIndependent: 'INDEPENDENT_SCHOOLS_ADMIN',
    IndependentAuthority: 'INDEPENDENT_AUTHORITY_ADMIN',
    SchoolOffshore: 'OFFSHORE_SCHOOLS_ADMIN'
  }
};

module.exports = roles;
