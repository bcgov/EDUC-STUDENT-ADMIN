const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const auth = require('../../../src/components/auth');
const utils = require('../../../src/components/utils');

const jsonwebtoken = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const { mockRequest, mockResponse } = require('../helpers'); 

const mockAxios = new MockAdapter(axios);

const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.2H0EJnt58ApysedXcvNUAy6FhgBIbDmPfq9d79qF4yQ';
const endlessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjB9.JWKPB-5Q8rTYzl-MfhRGpP9WpDpQxC7JkIAGFMDZnpg';
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Vg30C57s3l90JNap_VgMhKZjfc-p7SoBXaSAy8c28HA';

describe('isTokenExpired', () => {
  it('should return true if expired', async () => {
    const result = auth.isTokenExpired(expiredToken);
    expect(result).toBeTruthy();
  });

  it('should return false if no expiry', () => {
    const result = auth.isTokenExpired(endlessToken);
    expect(result).toBeFalsy();
  });

  it('should return false if not expired yet', () => {
    const result = auth.isTokenExpired(validToken);
    expect(result).toBeFalsy();
  });
});

describe('isRenewable', () => {
  it('should return false if expired', async () => {
    const result = auth.isRenewable(expiredToken);
    expect(result).toBeFalsy();
  });

  it('should return true if no expiry', () => {
    const result = auth.isRenewable(endlessToken);
    expect(result).toBeTruthy();
  });

  it('should return true if not expired yet', () => {
    const result = auth.isRenewable(validToken);
    expect(result).toBeTruthy();
  });
});

describe('renew', () => {
  const url = 'http://token.endpoint';
  const discovery = {
    token_endpoint: url,
    scopes_supported: ['openid', 'offline_access'],
  };

  const spy = jest.spyOn(utils, 'getOidcDiscovery');
  jest.mock('../../../src/components/utils');

  afterEach(() => {
    spy.mockClear();
  });
  
  /*it('should return new access and refresh tokens', async () => {
    utils.getOidcDiscovery.mockResolvedValue(discovery);
    mockAxios.onPost(url).reply(200, {
      access_token: validToken,
      refresh_token: endlessToken
    });

    const result = await auth.renew(endlessToken);

    expect(result).toBeTruthy();
    expect(result.jwt).toEqual(validToken);
    expect(result.refreshToken).toEqual(endlessToken);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });*/

  it('should gracefully return the error response', async () => {
    utils.getOidcDiscovery.mockResolvedValue(discovery);
    mockAxios.onPost(url).reply(400, {
      error: 'invalid_grant',
      error_description: 'Maximum allowed refresh token reuse exceeded'
    });

    const result = await auth.renew(endlessToken);

    expect(result).toBeTruthy();
    expect(result.error).toEqual('invalid_grant');
    expect(result.error_description).toEqual('Maximum allowed refresh token reuse exceeded');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });
});

describe('refreshJWT', () => {
  const spy = jest.spyOn(auth, 'renew');
  jest.mock('../../../src/components/auth');

  afterEach(() => {
    spy.mockClear();
  });

  it('should not have a user if no user or jwt exists', async () => {
    const result = await auth.refreshJWT({}, null, () => {});
    expect(result).toBeUndefined();
  });

  it('should not have a user if jwt is still valid', async () => {
    const result = await auth.refreshJWT({
      user: {
        jwt: validToken,
        refreshToken: endlessToken
      }
    }, null, () => {});
    expect(result).toBeUndefined();
  });

  it('should not have a user if jwt and refresh token are expired', async () => {
    const result = await auth.refreshJWT({
      user: {
        jwt: expiredToken,
        refreshToken: expiredToken
      }
    }, null, () => {});
    expect(result).toBeUndefined();
  });
});

describe('createRoleHelpers', () => {
  const roles = {
    User: {
      GMP: ['STUDENT_ADMIN', 'STUDENT_ADMIN_READ_ONLY'],
      UMP: ['STUDENT_PROFILE_ADMIN', 'STUDENT_PROFILE_READ_ONLY'],
      StudentSearch: ['STUDENT_SEARCH_ADMIN']
    },
    Admin: {
      GMP: 'STUDENT_ADMIN',
      UMP: 'STUDENT_PROFILE_ADMIN',
      StudentSearch: 'STUDENT_SEARCH_ADMIN'
    }
  }

  jest.spyOn(jsonwebtoken, 'verify');

  jest.spyOn(utils, 'getBackendToken'); 

  const helpers = auth.__get__('createRoleHelpers')(roles);

  let req;
  let res;
  let next;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue({});
    req = mockRequest({
      passport: {
        user: {
          jwt: 'token'
        }
      }
    });
    res = mockResponse();
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should have helper functions', () => {
    expect(helpers.isValidGMPUserToken).toBeInstanceOf(Function);
    expect(helpers.isValidGMPUser).toBeInstanceOf(Function);
    expect(helpers.isValidUMPUserToken).toBeInstanceOf(Function);
    expect(helpers.isValidUMPUser).toBeInstanceOf(Function);
    expect(helpers.isValidStudentSearchUserToken).toBeInstanceOf(Function);
    expect(helpers.isValidStudentSearchUser).toBeInstanceOf(Function);

    expect(helpers.isValidGMPAdmin).toBeInstanceOf(Function);
    expect(helpers.isValidUMPAdmin).toBeInstanceOf(Function);
    expect(helpers.isValidStudentSearchAdmin).toBeInstanceOf(Function);

    expect(helpers.isValidUsers).toBeInstanceOf(Function);
  });

  it ('should have isValidGMPUserToken helper function', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN']}});
    expect(helpers.isValidGMPUserToken).toBeInstanceOf(Function);
    helpers.isValidGMPUserToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it ('should have isValidGMPAdmin helper function', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN']}});
    expect(helpers.isValidGMPAdmin).toBeInstanceOf(Function);
    helpers.isValidGMPUserToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it ('should have isValidGMPUser helper function', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN']}});
    expect(helpers.isValidGMPUser).toBeInstanceOf(Function);
    expect(helpers.isValidGMPUser(req)).toBeTruthy();
  });

  it ('should have isValidUsers helper function', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN']}});
    expect(helpers.isValidUsers).toBeInstanceOf(Function);
    expect(helpers.isValidUsers(req)).toMatchObject({
      isValidGMPUser: true,
      isValidUMPUser: false,
      isValidStudentSearchUser: false
    });
  });

});

describe('isValidGMPUserToken', () => {
  const roles = {
    User: {
      GMP: ['STUDENT_ADMIN', 'STUDENT_ADMIN_READ_ONLY'],
      UMP: ['STUDENT_PROFILE_ADMIN', 'STUDENT_PROFILE_READ_ONLY'],
      StudentSearch: ['STUDENT_SEARCH_ADMIN']
    },
    Admin: {
      GMP: 'STUDENT_ADMIN',
      UMP: 'STUDENT_PROFILE_ADMIN',
      StudentSearch: 'STUDENT_SEARCH_ADMIN'
    }
  }

  jest.spyOn(jsonwebtoken, 'verify');

  jest.spyOn(utils, 'getBackendToken'); 

  const helpers = auth.__get__('createRoleHelpers')(roles);
  const isValidGMPUserToken = helpers.isValidGMPUserToken;

  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest({
      passport: {
        user: {
          jwt: 'token'
        }
      }
    });
    res = mockResponse();
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it ('should return 401 when no backend token', () => {
    utils.getBackendToken.mockReturnValue(null);
    isValidGMPUserToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it ('should call next when token and role are validated', () => {
    utils.getBackendToken.mockReturnValue({});
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN']}});
    isValidGMPUserToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it ('should return 401 when no right roles', () => {
    utils.getBackendToken.mockReturnValue({});
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_PROFILE_ADMIN']}});
    isValidGMPUserToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it ('should return 401 when failed to verify the token', () => {
    utils.getBackendToken.mockReturnValue({});
    jsonwebtoken.verify.mockReturnValue({});
    isValidGMPUserToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it ('should return 500 when excpetions', () => {
    utils.getBackendToken.mockReturnValue({});
    jsonwebtoken.verify.mockImplementation(() => { throw new Error('test error') });
    isValidGMPUserToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

describe('isValidGMPAdmin', () => {
  const roles = {
    User: {
      GMP: ['STUDENT_ADMIN', 'STUDENT_ADMIN_READ_ONLY'],
      UMP: ['STUDENT_PROFILE_ADMIN', 'STUDENT_PROFILE_READ_ONLY'],
      StudentSearch: ['STUDENT_SEARCH_ADMIN']
    },
    Admin: {
      GMP: 'STUDENT_ADMIN',
      UMP: 'STUDENT_PROFILE_ADMIN',
      StudentSearch: 'STUDENT_SEARCH_ADMIN'
    }
  }

  jest.spyOn(jsonwebtoken, 'verify');

  jest.spyOn(utils, 'getBackendToken'); 

  const helpers = auth.__get__('createRoleHelpers')(roles);
  const isValidGMPAdmin = helpers.isValidGMPAdmin;

  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest({
      passport: {
        user: {
          jwt: 'token'
        }
      }
    });
    res = mockResponse();
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it ('should return 401 when no backend token', () => {
    utils.getBackendToken.mockReturnValue(null);
    isValidGMPAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it ('should call next when token and role are validated', () => {
    utils.getBackendToken.mockReturnValue({});
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN']}});
    isValidGMPAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it ('should return 401 when no right roles', () => {
    utils.getBackendToken.mockReturnValue({});
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN_READ_ONLY']}});
    isValidGMPAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it ('should return 401 when failed to verify the token', () => {
    utils.getBackendToken.mockReturnValue({});
    jsonwebtoken.verify.mockReturnValue({});
    isValidGMPAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it ('should return 500 when excpetions', () => {
    utils.getBackendToken.mockReturnValue({});
    jsonwebtoken.verify.mockImplementation(() => { throw new Error('test error') });
    isValidGMPAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});


describe('isValidGMPUser', () => {
  const roles = {
    User: {
      GMP: ['STUDENT_ADMIN', 'STUDENT_ADMIN_READ_ONLY'],
      UMP: ['STUDENT_PROFILE_ADMIN', 'STUDENT_PROFILE_READ_ONLY'],
      StudentSearch: ['STUDENT_SEARCH_ADMIN']
    },
    Admin: {
      GMP: 'STUDENT_ADMIN',
      UMP: 'STUDENT_PROFILE_ADMIN',
      StudentSearch: 'STUDENT_SEARCH_ADMIN'
    }
  }

  jest.spyOn(jsonwebtoken, 'verify');

  jest.spyOn(utils, 'getBackendToken'); 

  const helpers = auth.__get__('createRoleHelpers')(roles);
  const isValidGMPUser = helpers.isValidGMPUser;

  let req;

  beforeEach(() => {
    req = mockRequest({
      passport: {
        user: {
          jwt: 'token'
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it ('should return false when no session', () => {
    req = mockRequest(null);
    expect(isValidGMPUser(req)).toBeFalsy();
  });

  it ('should return true when token and roles are validated', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN']}});
    expect(isValidGMPUser(req)).toBeTruthy();
  });

  it ('should return flase when no right roles', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_PROFILE_ADMIN']}});
    expect(isValidGMPUser(req)).toBeFalsy();
  });

  it ('should return flase when failed to verify the token', () => {
    jsonwebtoken.verify.mockReturnValue({});
    expect(isValidGMPUser(req)).toBeFalsy();
  });

  it ('should return false when excpetions', () => {
    jsonwebtoken.verify.mockImplementation(() => { throw new Error('test error') });
    expect(isValidGMPUser(req)).toBeFalsy();
  });

});


describe('isValidUsers', () => {
  const roles = {
    User: {
      GMP: ['STUDENT_ADMIN', 'STUDENT_ADMIN_READ_ONLY'],
      UMP: ['STUDENT_PROFILE_ADMIN', 'STUDENT_PROFILE_READ_ONLY'],
      StudentSearch: ['STUDENT_SEARCH_ADMIN']
    },
    Admin: {
      GMP: 'STUDENT_ADMIN',
      UMP: 'STUDENT_PROFILE_ADMIN',
      StudentSearch: 'STUDENT_SEARCH_ADMIN'
    }
  }

  jest.spyOn(jsonwebtoken, 'verify');

  const helpers = auth.__get__('createRoleHelpers')(roles);
  const isValidUsers = helpers.isValidUsers;

  let req;

  beforeEach(() => {
    req = mockRequest({
      passport: {
        user: {
          jwt: 'token'
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it ('should return true for isValidGMPUser', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN_READ_ONLY']}});
    expect(isValidUsers(req)).toMatchObject({
      isValidGMPUser: true,
      isValidUMPUser: false,
      isValidStudentSearchUser: false
    });
  });

  it ('should return true for isValidUMPUser', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN_READ_ONLY', 'STUDENT_PROFILE_READ_ONLY']}});
    expect(isValidUsers(req)).toMatchObject({
      isValidGMPUser: true,
      isValidUMPUser: true,
      isValidStudentSearchUser: false
    });
  });

  it ('should return true for isValidStudentSearchUser', () => {
    jsonwebtoken.verify.mockReturnValue({realm_access : { roles: ['STUDENT_ADMIN_READ_ONLY', 'STUDENT_PROFILE_READ_ONLY', 'STUDENT_SEARCH_ADMIN']}});
    expect(isValidUsers(req)).toMatchObject({
      isValidGMPUser: true,
      isValidUMPUser: true,
      isValidStudentSearchUser: true
    });
  });

});