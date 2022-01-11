const HttpStatus = require('http-status-codes');
const penRequests = require('../../../src/components/penRequests');
const requests = require('../../../src/components/requests');
jest.mock('../../../src/components/utils', () => {
  const originalModule = jest.requireActual('../../../src/components/utils');
  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    getBackendToken: jest.fn(),
    getData: jest.fn(),
    putData: jest.fn(),
    postData: jest.fn(),
    getUser: jest.fn().mockReturnValue({idir_username: 'User'}),
    formatCommentTimestamp: jest.fn(),
  };
});
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');
const { ApiError, ServiceError } = require('../../../src/components/error');
jest.mock('../../../src/config/index');
const config = require('../../../src/config/index');

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

describe('getPenRequestCommentById', () => {
  const userData = {
    idir_username: 'IDIR',
    idir_guid: '11'
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

  const getPenRequestCommentById = requests.getRequestCommentById('penRequest');

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
    await getPenRequestCommentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestCommentData);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockRejectedValue(new Error('test error'));
    await getPenRequestCommentById(req, res);
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

  const getPenRequestById = requests.getRequestById('penRequest');

  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getData');
  jest.spyOn(utils, 'getCodeLabel');
  jest.spyOn(utils, 'saveSession');

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
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
    utils.getData.mockResolvedValueOnce(penRequestData).mockResolvedValueOnce(digitalIdData);
    utils.getCodeLabel.mockReturnValueOnce(identityCodeLabel).mockReturnValueOnce(statusCodeLabel);
    utils.getCodeTable.mockResolvedValueOnce(identityCodeTableData).mockResolvedValueOnce(penRequestStatusCodesData);
    await getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestStrippedResponse);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeTable exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getCodeTable.mockRejectedValue(new ServiceError());
    await getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockRejectedValue(new ServiceError());
    await getPenRequestById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeLabel exceptions thrown', async () => {
    req.params = {
      id: '1'
    };
    utils.getCodeLabel.mockRejectedValue(new ServiceError());
    await getPenRequestById(req, res);
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
    await requests.getStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(formattedResponse);
  });
  it('should return 500 when no students returned', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockResolvedValue([]);
    await requests.getStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({message: 'INTERNAL SERVER ERROR'});
  });
  it('should return 500 getData fails', async () => {
    req.params = {
      id: '1'
    };
    utils.getData.mockResolvedValue(new ApiError());
    await requests.getStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({message: 'INTERNAL SERVER ERROR'});
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
    'studGender': 'M',
    'studStatus': 'A',
    'createDate': '2007-08-20',
    'createUserName': 'EDUC_PEN_MGR'
  };
  const studentData = [{
    'pen': '111111111',
    'legalLastName': 'POWERS',
    'legalFirstName': 'AUSTIN',
    'legalMiddleNames': 'DANGER',
    'usualLastName': 'POWERS',
    'usualFirstName': 'AUSTIN',
    'usualMiddleNames': 'DANGER',
    'dob': '1953-12-17',
    'genderCode': 'M',
    'localID': '12345',
    'postalCode': 'V8V1V2',
    'gradeCode': '1',
    'mincode': '101000001'
  }];
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
  it('should return demographicsData from demographics api', async () => {
    config.get.mockReturnValue(false);
    utils.getData.mockResolvedValue(demographicsData);
    await requests.getStudentDemographicsById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(formattedResponse);
  });
  it('should return NOT_FOUND if getData return 404', async () => {
    config.get.mockReturnValue(false);
    utils.getData.mockRejectedValue(new ApiError(HttpStatus.NOT_FOUND, 'test error'));
    await requests.getStudentDemographicsById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });
  it('should return demographicsData from student api', async () => {
    config.get.mockReturnValue(true);
    utils.getData.mockResolvedValue(studentData);
    await requests.getStudentDemographicsById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(formattedResponse);
  });
  it('should return NOT_FOUND if getData return empty array from student api', async () => {
    config.get.mockReturnValue(true);
    utils.getData.mockResolvedValue([]);
    await requests.getStudentDemographicsById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    utils.getData.mockRejectedValue(new Error('test error'));
    await requests.getStudentDemographicsById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('updatePenRequest', () => {
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'putData');
  jest.spyOn(utils, 'getCodeTable');
  jest.spyOn(utils, 'getCodeLabel');


  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.session.penRequest = {
      'createUser': 'PEN-REQUEST-API',
      'penRequestID': '1',
      'digitalID': 'a',
      'dataSourceCode': 'Basic BCeID'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw ServiceError error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    expect(requests.updateRequest(req, res, 'penRequest', penRequests.createPenRequestApiServiceReq)).rejects.toThrowError(ServiceError);
  });
  it('should return api error if there is no session data', async () => {
    delete req.session.penRequest;
    expect(requests.updateRequest(req, res, 'penRequest', penRequests.createPenRequestApiServiceReq)).rejects.toThrowError(ServiceError);
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
    finalResponse.penRequestStatusCodeLabel = 'Returned for more information';
    utils.putData.mockResolvedValue(penPutResponse);
    utils.getCodeTable.mockReturnValue(statusCodeResponse);
    utils.getCodeLabel.mockReturnValue('Returned for more information');
    expect(await requests.updateRequest(req, res, 'penRequest', penRequests.createPenRequestApiServiceReq)).toEqual(finalResponse);
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
    req = mockRequest();
    res = mockResponse();
    req.body = {};
    requests.__Rewire__('updateRequest', () => Promise.resolve(updatePenRequestRes));
  });

  afterEach(() => {
    jest.clearAllMocks();
    requests.__ResetDependency__('updateRequest');
  });
  it('should return penrequest data', async () => {
    await requests.__get__('putRequest')('penRequest', requests.createPenRequestApiServiceReq)(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(updatePenRequestRes);
  });
  it('should return 500 error if updatePenRequest fails', async () => {
    requests.__Rewire__('updateRequest', () => Promise.reject(new ServiceError('updatePenRequest',{ message: 'No access token'})));
    await requests.__get__('putRequest')('penRequest', requests.createPenRequestApiServiceReq)(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ message: 'INTERNAL SERVER ERROR', code: HttpStatus.INTERNAL_SERVER_ERROR});
  });
});



