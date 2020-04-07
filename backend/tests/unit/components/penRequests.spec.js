const {LocalDateTime} = require('@js-joda/core');

const HttpStatus = require('http-status-codes');
const penRequests = require('../../../src/components/penRequests');
jest.mock('../../../src/components/utils');
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');

describe('getAllPenRequests', () => {
  const penRequestStatusCodesData = [
    {
      'penRequestStatusCode': 'DRAFT',
      'label': 'Draft',
      'description': 'Request created but not yet submitted.',
      'displayOrder': 1,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'INITREV',
      'label': 'First Review',
      'description': 'Request has been submitted and is now in it\'s first review by staff.',
      'displayOrder': 2,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'RETURNED',
      'label': 'Returned for more information',
      'description': 'Request has been returned to the submitter for more information.',
      'displayOrder': 3,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'SUBSREV',
      'label': 'Subsequent Review',
      'description': 'Request has been resubmitted with more info and is now in another review by staff.',
      'displayOrder': 4,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'AUTO',
      'label': 'Completed by auto-match',
      'description': 'Request was completed by the auto-match process, without staff review.',
      'displayOrder': 5,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'MANUAL',
      'label': 'Completed by manual match',
      'description': 'Request was completed by staff determining the matching PEN.',
      'displayOrder': 6,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'REJECTED',
      'label': 'Could not be fulfilled',
      'description': 'Request could not be fullfilled by staff for the reasons provided.',
      'displayOrder': 7,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'UNMATCHED',
      'label': 'Unable to match',
      'description': 'Request could not be matched to a PEN.',
      'displayOrder': 8,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    }
  ];
  const penRequestsData = [
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '1',
      'digitalID': '1',
      'penRequestStatusCode': 'DRAFT',
      'legalFirstName': 'John',
      'legalMiddleNames': null,
      'legalLastName': 'Chwelo',
      'dob': '2008-05-07',
      'genderCode': 'X',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': null,
      'failureReason': null,
      'initialSubmitDate': null,
      'statusUpdateDate': '2020-03-05T14:45:17',
      'emailVerified': 'N',
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': null,
      'pen': null
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '2',
      'digitalID': '2',
      'penRequestStatusCode': 'MANUAL',
      'legalFirstName': 'John',
      'legalMiddleNames': null,
      'legalLastName': 'Cox',
      'dob': '1990-07-04',
      'genderCode': 'M',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': 'null',
      'failureReason': 'dd',
      'initialSubmitDate': '2020-03-13T11:11:46',
      'statusUpdateDate': '2020-03-16T21:26:20',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': null,
      'pen': '123456789'
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '3',
      'digitalID': '3',
      'penRequestStatusCode': 'SUBSREV',
      'legalFirstName': 'Silent',
      'legalMiddleNames': null,
      'legalLastName': 'Sam',
      'dob': '1960-01-16',
      'genderCode': 'X',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': null,
      'failureReason': null,
      'initialSubmitDate': '2020-03-16T18:32:09',
      'statusUpdateDate': '2020-03-16T18:47:13',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': null,
      'pen': null
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '4',
      'digitalID': '4',
      'penRequestStatusCode': 'INITREV',
      'legalFirstName': 'RICHENDA',
      'legalMiddleNames': null,
      'legalLastName': 'GRAFTON',
      'dob': '1974-03-24',
      'genderCode': 'M',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': null,
      'failureReason': null,
      'initialSubmitDate': '2020-03-17T09:29:12',
      'statusUpdateDate': '2020-03-17T09:29:12',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': 'ZEROMATCHES',
      'bcscAutoMatchDetails': 'Zero PEN records found by BCSC auto-match',
      'pen': null
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '5',
      'digitalID': '5',
      'penRequestStatusCode': 'REJECTED',
      'legalFirstName': null,
      'legalMiddleNames': null,
      'legalLastName': 'Wayne',
      'dob': '1997-01-01',
      'genderCode': 'M',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': 'null',
      'failureReason': 'Can\'t find the record.',
      'initialSubmitDate': '2020-03-10T11:39:01',
      'statusUpdateDate': '2020-03-10T13:29:52',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': 'No auto-match performed for Basic BCeID',
      'pen': null
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '6',
      'digitalID': '6',
      'penRequestStatusCode': 'RETURNED',
      'legalFirstName': null,
      'legalMiddleNames': null,
      'legalLastName': 'Wayne',
      'dob': '1994-02-03',
      'genderCode': 'M',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': 'null',
      'failureReason': 'Reject',
      'initialSubmitDate': '2020-03-02T14:22:41',
      'statusUpdateDate': '2020-03-11T16:10:31',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': 'RIGHTPEN',
      'bcscAutoMatchDetails': 'CORRECT auto-match to: 123456789 Smith, John',
      'pen': null
    }
  ];
  const penRequstsResponse = [
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '1',
      'penRequestStatusCode': {
        'penRequestStatusCode': 'DRAFT',
        'label': 'Draft',
        'description': 'Request created but not yet submitted.',
        'displayOrder': 1,
        'effectiveDate': '2020-01-01T00:00:00',
        'expiryDate': '2099-12-31T00:00:00'
      },
      'legalFirstName': 'John',
      'legalMiddleNames': null,
      'legalLastName': 'Chwelo',
      'dob': '2008-05-07',
      'genderCode': 'X',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': null,
      'failureReason': null,
      'initialSubmitDate': null,
      'statusUpdateDate': '2020-03-05T14:45:17',
      'emailVerified': 'N',
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': null,
      'pen': null
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '2',
      'penRequestStatusCode': {
        'penRequestStatusCode': 'MANUAL',
        'label': 'Completed by manual match',
        'description': 'Request was completed by staff determining the matching PEN.',
        'displayOrder': 6,
        'effectiveDate': '2020-01-01T00:00:00',
        'expiryDate': '2099-12-31T00:00:00'
      },
      'legalFirstName': 'John',
      'legalMiddleNames': null,
      'legalLastName': 'Cox',
      'dob': '1990-07-04',
      'genderCode': 'M',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': 'null',
      'failureReason': 'dd',
      'initialSubmitDate': '2020-03-13T11:11:46',
      'statusUpdateDate': '2020-03-16T21:26:20',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': null,
      'pen': '123456789'
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '3',
      'penRequestStatusCode': {
        'penRequestStatusCode': 'SUBSREV',
        'label': 'Subsequent Review',
        'description': 'Request has been resubmitted with more info and is now in another review by staff.',
        'displayOrder': 4,
        'effectiveDate': '2020-01-01T00:00:00',
        'expiryDate': '2099-12-31T00:00:00'
      },
      'legalFirstName': 'Silent',
      'legalMiddleNames': null,
      'legalLastName': 'Sam',
      'dob': '1960-01-16',
      'genderCode': 'X',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': null,
      'failureReason': null,
      'initialSubmitDate': '2020-03-16T18:32:09',
      'statusUpdateDate': '2020-03-16T18:47:13',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': null,
      'pen': null
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '4',
      'penRequestStatusCode': {
        'penRequestStatusCode': 'INITREV',
        'label': 'First Review',
        'description': 'Request has been submitted and is now in it\'s first review by staff.',
        'displayOrder': 2,
        'effectiveDate': '2020-01-01T00:00:00',
        'expiryDate': '2099-12-31T00:00:00'
      },
      'legalFirstName': 'RICHENDA',
      'legalMiddleNames': null,
      'legalLastName': 'GRAFTON',
      'dob': '1974-03-24',
      'genderCode': 'M',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': null,
      'failureReason': null,
      'initialSubmitDate': '2020-03-17T09:29:12',
      'statusUpdateDate': '2020-03-17T09:29:12',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': 'ZEROMATCHES',
      'bcscAutoMatchDetails': 'Zero PEN records found by BCSC auto-match',
      'pen': null
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '5',
      'penRequestStatusCode': {
        'penRequestStatusCode': 'REJECTED',
        'label': 'Could not be fulfilled',
        'description': 'Request could not be fullfilled by staff for the reasons provided.',
        'displayOrder': 7,
        'effectiveDate': '2020-01-01T00:00:00',
        'expiryDate': '2099-12-31T00:00:00'
      },
      'legalFirstName': null,
      'legalMiddleNames': null,
      'legalLastName': 'Wayne',
      'dob': '1997-01-01',
      'genderCode': 'M',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': 'null',
      'failureReason': 'Can\'t find the record.',
      'initialSubmitDate': '2020-03-10T11:39:01',
      'statusUpdateDate': '2020-03-10T13:29:52',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': 'No auto-match performed for Basic BCeID',
      'pen': null
    },
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': null,
      'updateDate': null,
      'penRequestID': '6',
      'penRequestStatusCode': {
        'penRequestStatusCode': 'RETURNED',
        'label': 'Returned for more information',
        'description': 'Request has been returned to the submitter for more information.',
        'displayOrder': 3,
        'effectiveDate': '2020-01-01T00:00:00',
        'expiryDate': '2099-12-31T00:00:00'
      },
      'legalFirstName': null,
      'legalMiddleNames': null,
      'legalLastName': 'Wayne',
      'dob': '1994-02-03',
      'genderCode': 'M',
      'usualFirstName': null,
      'usualMiddleName': null,
      'usualLastName': null,
      'email': 'email@email.com',
      'maidenName': null,
      'pastNames': null,
      'lastBCSchool': null,
      'lastBCSchoolStudentNumber': null,
      'currentSchool': null,
      'reviewer': 'null',
      'failureReason': 'Reject',
      'initialSubmitDate': '2020-03-02T14:22:41',
      'statusUpdateDate': '2020-03-11T16:10:31',
      'emailVerified': 'Y',
      'bcscAutoMatchOutcome': 'RIGHTPEN',
      'bcscAutoMatchDetails': 'CORRECT auto-match to: 123456789 Smith, John',
      'pen': null
    }
  ];
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getCodeTable.mockResolvedValue(penRequestStatusCodesData);
    utils.getData.mockResolvedValue(penRequestsData);
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return penRequstsResponse', async () => {
    await penRequests.getAllPenRequests(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequstsResponse);
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.getAllPenRequests(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeTable exceptions thrown', async () => {
    utils.getCodeTable.mockRejectedValue(new Error('test error'));
    await penRequests.getAllPenRequests(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    utils.getData.mockRejectedValue(new Error('test error'));
    await penRequests.getAllPenRequests(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getPenRequestCommentById', () => {
  const userData = {
    idir_username: 'IDIR',
    preferred_username: '1'
  };
  const penRequestsData = [
    {
      'createUser': 'PEN-REQUEST-API',
      'updateUser': 'PEN-REQUEST-API',
      'createDate': '2020-03-18T14:23:01',
      'updateDate': '2020-03-18T14:23:01',
      'penRetrievalReqCommentID': '1',
      'penRetrievalRequestID': '1',
      'staffMemberIDIRGUID': '1',
      'staffMemberName': 'IDIR',
      'commentContent': 'Sending a comment\n',
      'commentTimestamp': '2020-03-18T14:22:59'
    }
  ];
  const penRequestCommentData = {
    'participants': [],
    'myself': {
      'name': 'IDIR',
      'id': '1'
    },
    'messages': [
      {
        'content': 'Sending a comment\n',
        'participantId': '1',
        'timestamp': {
          'year': 2020,
          'month': 3,
          'day': 18,
          'hour': 14,
          'minute': 22,
          'second': 59,
          'millisecond': 0
        }
      }
    ]
  };

  let req;
  let res;
  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getUser');
  jest.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getUser.mockResolvedValue(userData);
    utils.getData.mockResolvedValue(penRequestsData);
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return penRequestCommentData', async () => {
    req.params = {
      id: '1'
    };
    await penRequests.getPenRequestCommentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestCommentData);
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.getPenRequestCommentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
  it('should return INTERNAL_SERVER_ERROR if no user info', async () => {
    utils.getUser.mockReturnValue(false);
    await penRequests.getPenRequestCommentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockRejectedValue(new Error('test error'));
    await penRequests.getPenRequestCommentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getPenRequestCodes', () => {
  const codeTableData = [
    {
      'penRequestStatusCode': 'DRAFT',
      'label': 'Draft',
      'description': 'Request created but not yet submitted.',
      'displayOrder': 1,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'INITREV',
      'label': 'First Review',
      'description': 'Request has been submitted and is now in it\'s first review by staff.',
      'displayOrder': 2,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'RETURNED',
      'label': 'Returned for more information',
      'description': 'Request has been returned to the submitter for more information.',
      'displayOrder': 3,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'SUBSREV',
      'label': 'Subsequent Review',
      'description': 'Request has been resubmitted with more info and is now in another review by staff.',
      'displayOrder': 4,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'AUTO',
      'label': 'Completed by auto-match',
      'description': 'Request was completed by the auto-match process, without staff review.',
      'displayOrder': 5,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'MANUAL',
      'label': 'Completed by manual match',
      'description': 'Request was completed by staff determining the matching PEN.',
      'displayOrder': 6,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'REJECTED',
      'label': 'Could not be fulfilled',
      'description': 'Request could not be fullfilled by staff for the reasons provided.',
      'displayOrder': 7,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'UNMATCHED',
      'label': 'Unable to match',
      'description': 'Request could not be matched to a PEN.',
      'displayOrder': 8,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    }
  ];
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getCodeTable');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getCodeTable.mockResolvedValue(codeTableData);
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return codeTableData', async () => {
    await penRequests.getPenRequestCodes('urlKey, cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(codeTableData);
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.getPenRequestCodes('urlKey, cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeTable exceptions thrown', async () => {
    utils.getCodeTable.mockRejectedValue(new Error('test error'));
    await penRequests.getPenRequestCodes('urlKey, cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getStudentDemographicsById', () => {
  const demographicsData = {
    'pen': '111111111',
    'studSurname': 'POWERS',
    'studGiven': 'AUSTIN',
    'studMiddle': 'DANGER',
    'usualSurname': 'POWERS',
    'usualGiven': 'AUSTIN',
    'usualMiddle': 'DANGER',
    'studBirth': '19531217',
    'studSex': 'M',
    'studStatus': 'A',
    'createDate': '2007-08-20',
    'createUserName': 'EDUC_PEN_MGR'
  };
  const formattedValue = '1953-12-17';
  const formattedResponse = {
    'legalFirst': 'AUSTIN',
    'legalMiddle': 'DANGER',
    'legalLast': 'POWERS',
    'usualFirst': 'AUSTIN',
    'usualMiddle': 'DANGER',
    'usualLast': 'POWERS',
    'dob': '1953-12-17',
    'gender': 'M'
  };
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getData');
  jest.spyOn(utils, 'formatDate');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(demographicsData);
    utils.formatDate.mockReturnValue(formattedValue);
    req = mockRequest();
    res = mockResponse();
    req.session = {
      studentDemographics: {
        dob: '1991-12-17'
      }
    };
    req.params = {
      id: '111111111'
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return demographicsData', async () => {
    await penRequests.getStudentDemographicsById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(formattedResponse);
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.getStudentDemographicsById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    utils.getData.mockRejectedValue(new Error('test error'));
    await penRequests.getStudentDemographicsById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('postPenRequestComment', () => {
  const userData = {
    idir_username: 'IDIR',
    preferred_username: '1'
  };
  const dateTime = LocalDateTime.now();
  const response = {
    'createUser': 'PEN-REQUEST-API',
    'updateUser': 'PEN-REQUEST-API',
    'createDate': '2020-03-31T14:22:23.893',
    'updateDate': '2020-03-31T14:22:23.893',
    'penRetrievalReqCommentID': 'ac335eee-711d-13b2-8171-3259533b0000',
    'penRetrievalRequestID': 'ac336ce7-70b1-1e98-8170-c02506390011',
    'staffMemberIDIRGUID': 'E6DF3063E5104583AA0477DB775A7216',
    'staffMemberName': 'IDIR',
    'commentContent': 'ye boi\n',
    'commentTimestamp': dateTime.toString()
  };
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getUser');
  jest.spyOn(LocalDateTime, 'now');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getUser.mockReturnValue(userData);
    utils.postData.mockReturnValue(response);
    LocalDateTime.now.mockReturnValue(dateTime);
    req = mockRequest();
    res = mockResponse();
    req.body = {
      content: 'This is email content'
    };
    req.params = {
      id: '111111111'
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return demographicsData', async () => {
    await penRequests.postPenRequestComment(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(response);
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.postPenRequestComment(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
  it('should return INTERNAL_SERVER_ERROR if no user info', async () => {
    utils.getUser.mockReturnValue(false);
    await penRequests.postPenRequestComment(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    utils.postData.mockRejectedValue(new Error('test error'));
    await penRequests.postPenRequestComment(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

/*describe('putPenRequest', () => {
  const penRequestResponse = {
    'createUser': 'PEN-REQUEST-API',
    'updateUser': 'PEN-REQUEST-API',
    'createDate': null,
    'updateDate': null,
    'penRequestID': 'ac336ce7-70b1-1e98-8170-c03406390011',
    'penRequestStatusCode': 'SUBSREV',
    'legalFirstName': 'Fake',
    'legalMiddleNames': null,
    'legalLastName': 'Name',
    'dob': '1998-03-04',
    'genderCode': 'M',
    'usualFirstName': null,
    'usualMiddleName': null,
    'usualLastName': null,
    'email': 'email@email.ca',
    'maidenName': null,
    'pastNames': null,
    'lastBCSchool': null,
    'lastBCSchoolStudentNumber': null,
    'currentSchool': null,
    'reviewer': 'JOCOX',
    'failureReason': null,
    'initialSubmitDate': '2020-03-09T09:33:07',
    'statusUpdateDate': '2020-03-16T10:17:53',
    'emailVerified': 'Y',
    'bcscAutoMatchOutcome': null,
    'bcscAutoMatchDetails': 'No auto-match performed for Basic BCeID',
    'pen': null,
    'dataSourceCode': 'Basic BCeID',
    'penRequestStatusCodeLabel': 'Subsequent Review'
  };
  let req;
  let res;

  //jest.mock('../../../src/components/penRequests');
  //jest.spyOn(penRequests, 'updatePenRequest');


  let barSpy;

  beforeEach(() => {
    //penRequests.updatePenRequest.mockResolvedValue(penRequestResponse);
    barSpy = jest.spyOn(
      penRequests,
      'updatePenRequest'
    ).mockImplementation(jest.fn());
    req = mockRequest();
    res = mockResponse();
  });
  afterEach(() => {
    //jest.clearAllMocks();
    barSpy.mockRestore();
  });
  it('should return penRequestResponse', async () => {
    penRequests.updatePenRequest.mockRejectedValue(new Error('test error'));
    await penRequests.putPenRequest(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestResponse);
  });
  it('should return INTERNAL_SERVER_ERROR if putPenRequest throws exception', async () => {
    penRequests.updatePenRequest.mockRejectedValue(new Error('test error'));
    await penRequests.putPenRequest(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});*/

describe('getPenRequestById', () => {
  const penRequestData = {
    'createUser': 'PEN-REQUEST-API',
    'updateUser': 'PEN-REQUEST-API',
    'createDate': null,
    'updateDate': null,
    'penRequestID': '1',
    'digitalID': '1',
    'penRequestStatusCode': 'SUBSREV',
    'legalFirstName': 'Silent',
    'legalMiddleNames': null,
    'legalLastName': 'Sam',
    'dob': '1960-01-16',
    'genderCode': 'X',
    'usualFirstName': null,
    'usualMiddleName': null,
    'usualLastName': null,
    'email': 'email@email.com',
    'maidenName': null,
    'pastNames': null,
    'lastBCSchool': null,
    'lastBCSchoolStudentNumber': null,
    'currentSchool': null,
    'reviewer': null,
    'failureReason': null,
    'initialSubmitDate': '2020-03-16T18:32:09',
    'statusUpdateDate': '2020-03-16T18:47:13',
    'emailVerified': 'Y',
    'bcscAutoMatchOutcome': null,
    'bcscAutoMatchDetails': null,
    'pen': null
  };
  const digitalIdData = {
    'digitalID': '1',
    'studentID': null,
    'identityTypeCode': 'BASIC',
    'identityValue': '1',
    'lastAccessDate': '2020-03-16T18:29:54',
    'lastAccessChannelCode': 'OSPR',
    'createUser': '1',
    'createDate': '2020-02-25T23:42:35',
    'updateUser': '1',
    'updateDate': '2020-03-16T18:29:54'
  };
  const identityCodeTableData = [
    {
      'identityTypeCode': 'PERSONAL',
      'label': 'Personal BCeID',
      'description': 'Digital Identity via a Personal BCeID, serviced by CITZ/IDIM.',
      'displayOrder': 3,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'identityTypeCode': 'BCSC',
      'label': 'BC Services Card',
      'description': 'Digital Identity via a BC Services Card, serviced by CITZ/IDIM.',
      'displayOrder': 1,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'identityTypeCode': 'BASIC',
      'label': 'Basic BCeID',
      'description': 'Digital Identity via a Basic BCeID, serviced by CITZ/IDIM.',
      'displayOrder': 2,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    }
  ];
  const statusesCodeTableData = [
    {
      'penRequestStatusCode': 'DRAFT',
      'label': 'Draft',
      'description': 'Request created but not yet submitted.',
      'displayOrder': 1,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'INITREV',
      'label': 'First Review',
      'description': 'Request has been submitted and is now in it\'s first review by staff.',
      'displayOrder': 2,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'RETURNED',
      'label': 'Returned for more information',
      'description': 'Request has been returned to the submitter for more information.',
      'displayOrder': 3,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'SUBSREV',
      'label': 'Subsequent Review',
      'description': 'Request has been resubmitted with more info and is now in another review by staff.',
      'displayOrder': 4,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'AUTO',
      'label': 'Completed by auto-match',
      'description': 'Request was completed by the auto-match process, without staff review.',
      'displayOrder': 5,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'MANUAL',
      'label': 'Completed by manual match',
      'description': 'Request was completed by staff determining the matching PEN.',
      'displayOrder': 6,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'REJECTED',
      'label': 'Could not be fulfilled',
      'description': 'Request could not be fullfilled by staff for the reasons provided.',
      'displayOrder': 7,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    },
    {
      'penRequestStatusCode': 'UNMATCHED',
      'label': 'Unable to match',
      'description': 'Request could not be matched to a PEN.',
      'displayOrder': 8,
      'effectiveDate': '2020-01-01T00:00:00',
      'expiryDate': '2099-12-31T00:00:00'
    }
  ];
  const identityCodeLabel = 'Basic BCeID';
  const statusCodeLabel = 'Subsequent Review';
  const penRequestResponse = {
    'createUser': 'PEN-REQUEST-API',
    'updateUser': 'PEN-REQUEST-API',
    'createDate': null,
    'updateDate': null,
    'penRequestID': '1',
    'penRequestStatusCode': 'SUBSREV',
    'legalFirstName': 'Silent',
    'legalMiddleNames': null,
    'legalLastName': 'Sam',
    'dob': '1960-01-16',
    'genderCode': 'X',
    'usualFirstName': null,
    'usualMiddleName': null,
    'usualLastName': null,
    'email': 'email@email.com',
    'maidenName': null,
    'pastNames': null,
    'lastBCSchool': null,
    'lastBCSchoolStudentNumber': null,
    'currentSchool': null,
    'reviewer': null,
    'failureReason': null,
    'initialSubmitDate': '2020-03-16T18:32:09',
    'statusUpdateDate': '2020-03-16T18:47:13',
    'emailVerified': 'Y',
    'bcscAutoMatchOutcome': null,
    'bcscAutoMatchDetails': null,
    'pen': null,
    'dataSourceCode': 'Basic BCeID',
    'penRequestStatusCodeLabel': 'Subsequent Review'
  };
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getData');
  jest.spyOn(utils, 'getCodeLabel');
  jest.spyOn(utils, 'saveSession');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getData.mockResolvedValueOnce(penRequestData).mockResolvedValueOnce(digitalIdData);
    utils.getCodeLabel.mockReturnValueOnce(identityCodeLabel).mockReturnValueOnce(statusCodeLabel);
    utils.saveSession.mockReturnValue(null);
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return penRequestResponse', async () => {
    req.params = {
      id: '1'
    };
    utils.getCodeTable.mockResolvedValueOnce(identityCodeTableData).mockResolvedValueOnce(statusesCodeTableData);
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestResponse);
  });
  it('should return unauthorized error if no token', async () => {
    req.params = {
      id: '1'
    };
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeTable exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getCodeTable.mockRejectedValue(new Error('test error'));
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockRejectedValue(new Error('test error'));
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeLabel exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getCodeLabel.mockRejectedValue(new Error('test error'));
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
