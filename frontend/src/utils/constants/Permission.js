export const PERMISSION = Object.freeze(
  {
    EDX_USER_SCHOOL_ADMIN: 'EDX_USER_SCHOOL_ADMIN',

    SECURE_EXCHANGE: 'SECURE_EXCHANGE',

    EDX_USER_DISTRICT_ADMIN: 'EDX_USER_DISTRICT_ADMIN',

    STUDENT_DATA_COLLECTION: 'STUDENT_DATA_COLLECTION',

    MANAGE_EDX_DISTRICT_USERS_PERMISSION: 'MANAGE_EDX_DISTRICT_USERS_PERMISSION',

    MANAGE_EDX_SCHOOL_USERS_PERMISSION: 'MANAGE_EDX_SCHOOL_USERS_PERMISSION',

    VIEW_SCHOOL_PERMISSION: 'VIEW_SCHOOL_PERMISSION',

    VIEW_DISTRICT_PERMISSION: 'VIEW_DISTRICT_PERMISSION',

    VIEW_AUTHORITY_PERMISSION: 'VIEW_AUTHORITY_PERMISSION',

    EDIT_SCHOOL_PERMISSION: 'EDIT_SCHOOL_PERMISSION',

    EDIT_DISTRICT_PERMISSION: 'EDIT_DISTRICT_PERMISSION',

    EDIT_INDEPENDENT_SCHOOL_PERMISSION: 'EDIT_INDEPENDENT_SCHOOL_PERMISSION',

    EDIT_OFFSHORE_SCHOOL_PERMISSION: 'EDIT_OFFSHORE_SCHOOL_PERMISSION',

    EDIT_INDEPENDENT_AUTHORITY_PERMISSION: 'EDIT_INDEPENDENT_AUTHORITY_PERMISSION',

    EDIT_OFFSHORE_AUTHORITY_PERMISSION: 'EDIT_OFFSHORE_AUTHORITY_PERMISSION',

    MANAGE_EXCHANGE_PEN_INBOX_PERMISSION: 'MANAGE_EXCHANGE_PEN_INBOX_PERMISSION',

    VIEW_REGISTRATION_CONTACTS_PERMISSION: 'VIEW_REGISTRATION_CONTACTS_PERMISSION',

    REPORTS_SDC_PUBLIC_SCHOOLS_PERMISSION: 'REPORTS_SDC_PUBLIC_SCHOOLS_PERMISSION',

    REPORTS_SDC_INDEPENDENT_SCHOOLS_PERMISSION: 'REPORTS_SDC_INDEPENDENT_SCHOOLS_PERMISSION',

    REPORTS_SDC_HEADCOUNTS_PERMISSION: 'REPORTS_SDC_HEADCOUNTS_PERMISSION'
  }
);

export function hasRequiredPermission(userInfo, permission){
  return (userInfo?.userRoles?.filter(perm => perm === permission).length > 0);
}

export function hasRequiredRole(userInfo, role){
  return (userInfo?.userRoles?.filter(rl => role === rl).length > 0);
}
