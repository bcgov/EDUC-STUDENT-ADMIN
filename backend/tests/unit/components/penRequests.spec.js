const {LocalDateTime} = require('@js-joda/core');

const HttpStatus = require('http-status-codes');
const penRequests = require('../../../src/components/penRequests');
//const {  updatePenRequest, __RewireAPI__ as rewirePenRequests} =  require('../../../src/components/penRequests');
jest.mock('../../../src/components/utils');
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');
const { ApiError, ServiceError } = require('../../../src/components/error');

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

const genderCodesData = [
  {
    'genderCode': 'M',
    'label': 'Male',
  },
  {
    'genderCode': 'F',
    'label': 'Female',
  }
];

/*describe('getAllPenRequests', () => {
  const penRequestsData = {
    'content': [
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
    ],
    'pageable': {
      'sort': {
        'sorted': true,
        'unsorted': false,
        'empty': false
      },
      'pageSize': 15,
      'pageNumber': 0,
      'offset': 0,
      'paged': true,
      'unpaged': false
    },
    'last': true,
    'totalPages': 1,
    'totalElements': 5,
    'sort': {
      'sorted': true,
      'unsorted': false,
      'empty': false
    },
    'first': true,
    'numberOfElements': 5,
    'size': 15,
    'number': 0,
    'empty': false
  };
  const penRetrievalResponse = {
    'content': [
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
    ],
    'pageable': {
      'sort': {
        'sorted': true,
        'unsorted': false,
        'empty': false
      },
      'pageSize': 15,
      'pageNumber': 0,
      'offset': 0,
      'paged': true,
      'unpaged': false
    },
    'last': true,
    'totalPages': 1,
    'totalElements': 5,
    'sort': {
      'sorted': true,
      'unsorted': false,
      'empty': false
    },
    'first': true,
    'numberOfElements': 5,
    'size': 15,
    'number': 0,
    'empty': false
  };
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getData');
  jest.spyOn(utils, 'getCodeTable');

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
    req.query = {
      'pageNumber': '0',
      'pageSize': '15',
      'sort': {'initialSubmitDate':'ASC'},
      'statusFilters': [
        'First Review',
        'Subsequent Review'
      ]
    };
    await penRequests.getAllPenRequests(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRetrievalResponse);
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
});*/

describe('completePenRequest', () => {

  const updatePenRequestRes = {
    penRequestID: 'penRequestID'
  };
  const dateTime = LocalDateTime.now();
  let req;
  let res;

  jest.spyOn(LocalDateTime, 'now');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.body = {};
    LocalDateTime.now.mockReturnValue(dateTime);
    penRequests.__Rewire__('updatePenRequest', () => Promise.resolve(updatePenRequestRes));
    penRequests.__Rewire__('sendPenRequestEmail', () => Promise.resolve());
    penRequests.__Rewire__('updateStudentAndDigitalId', () => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
    penRequests.__ResetDependency__('updatePenRequest');
    penRequests.__ResetDependency__('sendPenRequestEmail');
    penRequests.__ResetDependency__('updateStudentAndDigitalId');
  });
  it('should return penrequest data', async () => {
    await penRequests.__get__('completePenRequest')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(updatePenRequestRes);
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.__get__('completePenRequest')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
  it('should return 500 error if updatePenRequest fails', async () => {
    penRequests.__Rewire__('updatePenRequest', () => Promise.reject(new ServiceError('updatePenRequest',{ message: 'No access token'})));
    await penRequests.__get__('completePenRequest')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ message: 'INTERNAL SERVER ERROR'});
  });
  it('should return 500 error if sendPenRequestEmail fails', async () => {
    penRequests.__Rewire__('sendPenRequestEmail', () => Promise.reject(new ServiceError('updatePenRequest',{ message: 'No access token'})));
    await penRequests.__get__('completePenRequest')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ message: 'INTERNAL SERVER ERROR'});
  });
  it('should return 500 error if updateStudentAndDigitalId fails', async () => {
    penRequests.__Rewire__('updateStudentAndDigitalId', () => Promise.reject(new ApiError(500, {message: 'API error'})));
    await penRequests.__get__('completePenRequest')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ message: 'INTERNAL SERVER ERROR'});
  });
});

describe('getMacroData', () => {
  let req;
  let res;
  const macroObject = {label: 'data', createUser: 'user', macroId: '1'};
  const strippedMacroObject = {label: 'data', macroId: '1'};

  const formattedResponse = {
    returnMacros: [{label: 'data'}],
    rejectMacros: [{label: 'data'}],
    completeMacros: [{label: 'data'}]
  };


  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all macros correctly', async () => {
    utils.getData.mockResolvedValue([macroObject]);
    utils.stripAuditColumns.mockReturnValue(strippedMacroObject);

    await penRequests.getMacros(req,res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(formattedResponse);
  });
  it('should return 500 if getData fails', async () => {
    utils.getData.mockResolvedValue(new ApiError());
    utils.stripAuditColumns.mockReturnValue(strippedMacroObject);

    await penRequests.getMacros(req,res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({message: 'INTERNAL SERVER ERROR'});
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.getMacros(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
});

describe('getPenRequestCommentById', () => {
  const userData = {
    idir_username: 'IDIR',
    preferred_username: '11'
  };
  const penRequestsData = [
    {
      'penRetrievalReqCommentID': '2',
      'penRetrievalRequestID': '1',
      'staffMemberIDIRGUID': '',
      'staffMemberName': '',
      'commentContent': 'Sending a student comment\n',
      'commentTimestamp': '2020-04-18T14:22:59'
    },
    {
      'penRetrievalReqCommentID': '1',
      'penRetrievalRequestID': '1',
      'staffMemberIDIRGUID': '11',
      'staffMemberName': 'IDIR',
      'commentContent': 'Sending a comment\n',
      'commentTimestamp': '2020-03-18T14:22:59'
    }
  ];
  const penRequestCommentData = {
    'messages': [
      {
        'content': 'Sending a comment\n',
        'participantId': '11',
        'name': 'IDIR',
        'color': 'adminGreen',
        'icon': '$question',
        'timestamp': '2020-03-18 2:22pm'
      },
      {
        'content': 'Sending a student comment\n',
        'participantId': '1',
        'name': 'Student',
        'color': 'studentBlue',
        'icon': '$info',
        'timestamp': '2020-04-18 2:22pm'
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
    utils.formatCommentTimestamp.mockReturnValue('2020-03-18 2:22pm');
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return properly formatted comments in the right order', async () => {
    req.params = {
      id: '1'
    };
    utils.formatCommentTimestamp.mockReturnValueOnce('2020-03-18 2:22pm').mockReturnValueOnce('2020-04-18 2:22pm');
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
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getCodeTable');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getCodeTable.mockResolvedValue(penRequestStatusCodesData);
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return codeTableData', async () => {
    await penRequests.getPenRequestCodes('urlKey, cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestStatusCodesData);
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
  const identityCodeLabel = 'Basic BCeID';
  const statusCodeLabel = 'Subsequent Review';
  const penRequestStrippedResponse = {
    'penRequestID': '1',
    'penRequestStatusCode': 'Subsequent Review',
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
    utils.saveSession.mockReturnValue(null);
    utils.stripAuditColumns.mockReturnValue(penRequestStrippedResponse);
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
    utils.getData.mockResolvedValueOnce(penRequestData).mockResolvedValueOnce(digitalIdData);
    utils.getCodeLabel.mockReturnValueOnce(identityCodeLabel).mockReturnValueOnce(statusCodeLabel);
    utils.getCodeTable.mockResolvedValueOnce(identityCodeTableData).mockResolvedValueOnce(penRequestStatusCodesData);
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestStrippedResponse);
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
    utils.getCodeTable.mockRejectedValue(new ServiceError());
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockRejectedValue(new ServiceError());
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeLabel exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getCodeLabel.mockRejectedValue(new ServiceError());
    await penRequests.getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getStudentById', () => {
  let req;
  let res;
  const studentData = [{
    studentId: '1',
    legalFirstName: 'legalFirstName',
    legalMiddleNames: 'legalMiddleNames',
    legalLastName: 'legalLastName',
    usualFirstName: 'usualFirstName',
    usualMiddleNames: 'usualMiddleNames',
    usualLastName: 'usualLastName',
    dob: 'dob',
    genderCode: 'genderCode'
  }];
  const formattedResponse = Object.keys(studentData[0]).filter(key => key!=='studentId').reduce( (re, key) => Object.assign(re, { [key]: studentData[0][key] }), {} );
  formattedResponse.genderCode = 'genderLabel';

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getData');
  jest.spyOn(utils, 'getCodeTable');
  jest.spyOn(utils, 'getCodeLabel');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getCodeTable.mockResolvedValue(genderCodesData);
    utils.getCodeLabel.mockReturnValue('genderLabel');
    req = mockRequest();
    res = mockResponse();
    req.params = {
      id: '1'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return penRequestResponse', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockResolvedValue(studentData);
    await penRequests.getStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(formattedResponse);
  });
  it('should return 500 when no students returned', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockResolvedValue([]);
    await penRequests.getStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({message: 'INTERNAL SERVER ERROR'});
  });
  it('should return 500 getData fails', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockResolvedValue(new ApiError());
    await penRequests.getStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({message: 'INTERNAL SERVER ERROR'});
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequests.getStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
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
    preferred_username: '11'
  };
  const dateTime = LocalDateTime.now();
  const postCommentResponse = {
    'commentContent': 'This is email content',
    'staffMemberIDIRGUID': '11',
    'staffMemberName': 'IDIR',
    'commentTimestamp': dateTime.toString()
  };
  const responser = {
    content: 'This is email content',
    participantId: '11',
    name: 'IDIR',
    timestamp: dateTime.toString(),
    color: 'adminGreen',
    icon: '$question'
  };
  let req;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getUser');
  jest.spyOn(LocalDateTime, 'now');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getUser.mockReturnValue(userData);
    utils.postData.mockReturnValue(postCommentResponse);
    utils.formatCommentTimestamp.mockReturnValue(dateTime.toString());
    LocalDateTime.now.mockReturnValue(dateTime);
    req = mockRequest();
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
    expect(await penRequests.postPenRequestComment(req)).toEqual(responser);
  });
  it('should throw ServiceError error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    expect(penRequests.postPenRequestComment(req)).rejects.toThrowError(ServiceError);
  });
  it('should throw ServiceError if no user info', async () => {
    utils.getUser.mockReturnValue(false);
    expect(penRequests.postPenRequestComment(req)).rejects.toThrowError(ServiceError);
  });
  it('should throw ServiceError if postData exceptions thrown', async () => {
    utils.postData.mockRejectedValue(new Error('test error'));
    expect(penRequests.postPenRequestComment(req)).rejects.toThrowError(ServiceError);
  });
});

describe('updatePenRequest', () => {
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'putData');
  jest.spyOn(utils, 'getCodeTable');
  jest.spyOn(utils, 'stripAuditColumns');
  jest.spyOn(utils, 'getCodeLabel');


  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.session.penRequest = {
      'createUser': 'PEN-REQUEST-API',
      'penRequestID': '1',
      'digitalID': 'a'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw ServiceError error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    expect(penRequests.updatePenRequest(req, res)).rejects.toThrowError(ServiceError);
  });
  it('should return api error if there is no session data', async () => {
    delete req.session.penRequest;
    expect(penRequests.updatePenRequest(req, res)).rejects.toThrowError(ServiceError);
  });
  it('should return successfully updated pen request with removed sensitive data', async () => {
    req.body = {
      'penRequestID': '1',
      'pen': '',
      'penRequestStatusCode': 'RETURNED',
      'reviewer': 'JOCOX',
      'failureReason': null,
      'completeComment': null,
      'demogChanged': null,
      'bcscAutoMatchOutcome': null,
      'bcscAutoMatchDetails': null,
      'content': 'I said info',
      'statusUpdateDate': '2020-05-21T10:35:43.908'
    };

    const penPutResponse = {
      ...req.session.penRequest,
      ...req.body
    };
    const statusCodeResponse = [
      {
        'penRequestStatusCode': 'DRAFT',
        'label': 'Draft'
      },
      {
        'penRequestStatusCode': 'INITREV',
        'label': 'First Review'
      }
    ];

    const stripedResponse = Object.keys(penPutResponse).filter(key => key!=='createUser').reduce( (re, key) => Object.assign(re, { [key]: penPutResponse[key] }), {} );
    const finalResponse = Object.keys(stripedResponse).filter(key => key!=='digitalID').reduce( (re, key) => Object.assign(re, { [key]: stripedResponse[key] }), {} );
    utils.putData.mockResolvedValue(penPutResponse);
    utils.getCodeTable.mockReturnValue(statusCodeResponse);
    utils.stripAuditColumns.mockReturnValue(stripedResponse);
    utils.getCodeLabel.mockReturnValue('Returned for more information');
    expect(await penRequests.updatePenRequest(req, res)).toEqual(finalResponse);
  });
});

describe('putPenRequest', () => {
  const updatePenRequestRes = {
    penRequestID: 'penRequestID'
  };
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.stripAuditColumns.mockReturnValue(updatePenRequestRes);
    req = mockRequest();
    res = mockResponse();
    req.body = {};
    penRequests.__Rewire__('updatePenRequest', () => Promise.resolve(updatePenRequestRes));
  });

  afterEach(() => {
    jest.clearAllMocks();
    penRequests.__ResetDependency__('updatePenRequest');
  });
  it('should return penrequest data', async () => {
    await penRequests.__get__('putPenRequest')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(updatePenRequestRes);
  });
  it('should return 500 error if updatePenRequest fails', async () => {
    penRequests.__Rewire__('updatePenRequest', () => Promise.reject(new ServiceError('updatePenRequest',{ message: 'No access token'})));
    await penRequests.__get__('putPenRequest')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ message: 'INTERNAL SERVER ERROR'});
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


