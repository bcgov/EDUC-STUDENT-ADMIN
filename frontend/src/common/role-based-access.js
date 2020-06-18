const roleActionMap = {
  penRequest: {
    'CLAIM_REQUEST': ['STUDENT_ADMIN'],
    'PROVIDE_PEN': ['STUDENT_ADMIN'],
    'REQUEST_MORE_INFO': ['STUDENT_ADMIN'],
    'REJECT_REQUEST': ['STUDENT_ADMIN'],
    'CHANGE_DOCUMENT_TYPE': ['STUDENT_ADMIN'],
    'RELEASE_REQUEST': ['STUDENT_ADMIN']
  },
  studentRequest: {
    'CLAIM_REQUEST': ['STUDENT_PROFILE_ADMIN'],
    'SEND_UPDATE': ['STUDENT_PROFILE_ADMIN'],
    'REQUEST_MORE_INFO': ['STUDENT_PROFILE_ADMIN'],
    'REJECT_REQUEST': ['STUDENT_PROFILE_ADMIN'],
    'CHANGE_DOCUMENT_TYPE': ['STUDENT_PROFILE_ADMIN'],
    'RELEASE_REQUEST': ['STUDENT_PROFILE_ADMIN']
  },
};

function isAccessEnabledForUser(requestType, actionName, userInfo) {
  const rolesAllowed = roleActionMap[requestType][actionName];
  if (rolesAllowed !== undefined) {
    const userRoles = userInfo.userRoles;
    if (rolesAllowed.indexOf('*') !== -1) {
      return true;
    } else return userHasRole(rolesAllowed, userRoles);
  }
  return true;
}

function userHasRole(rolesAllowed, userRoles) {
  let userHasValidRole = false;
  for (const index in userRoles) {
    if (rolesAllowed.indexOf(userRoles[index]) !== -1) {
      userHasValidRole = true;
      break;
    }
  }
  return userHasValidRole;
}

function isReadonlyUserGMP(userRoles) {
  let isReadOnly = true;
  for (const index in userRoles) {
    if ('STUDENT_ADMIN' === userRoles[index]) {
      isReadOnly = false;
      break;
    }
  }
  return isReadOnly;
}

function isReadonlyUserUMP(userRoles) {
  let isReadOnly = true;
  for (const index in userRoles) {
    if ('STUDENT_PROFILE_ADMIN' === userRoles[index]) {
      isReadOnly = false;
      break;
    }
  }
  return isReadOnly;
}

module.exports = {
  AccessEnabledForUser: isAccessEnabledForUser,
  ReadOnlyUserGMP: isReadonlyUserGMP,
  ReadonlyUserUMP: isReadonlyUserUMP
};
