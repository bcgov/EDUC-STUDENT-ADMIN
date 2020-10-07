const HttpStatus = require('http-status-codes');
const penRequestBatch = require('../../../src/components/penRequestBatch');
jest.mock('../../../src/components/utils', () => {
  const originalModule = jest.requireActual('../../../src/components/utils');
  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    getBackendToken: jest.fn(),
    getData: jest.fn(),
    putData: jest.fn(),
  };
});
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');

const prbStudentData =
  {
    'penRequestBatchStudentID': 'c0a8014d-74e1-1d99-8174-e10db8410001',
    'penRequestBatchID': 'c0a8014d-74e1-1d99-8174-e10db81f0000',
    'penRequestBatchStudentStatusCode':'FIXABLE',
    'localID':'123456',
    'legalFirstName':'Ben'
  };

describe('updatePrbStudentInfoRequested', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.body = {
      infoRequest: 'test',
      penRequestBatchStudentStatusCode: 'FIXABLE'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return UNAUTHORIZED if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequestBatch.updatePrbStudentInfoRequested(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return data if success', async () => {
    const resp = {...prbStudentData, ...req.body};
    utils.getData.mockResolvedValue(prbStudentData);
    utils.putData.mockResolvedValue(resp);
    await penRequestBatch.updatePrbStudentInfoRequested(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should return INTERNAL_SERVER_ERROR if getData failed', async () => {
    utils.getData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.updatePrbStudentInfoRequested(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return INTERNAL_SERVER_ERROR if putData failed', async () => {
    utils.getData.mockResolvedValue(prbStudentData);
    utils.putData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.updatePrbStudentInfoRequested(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getPenRequestBatchStudentMatchOutcome', () => {
  let req;
  let res;

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getData');


  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.query = {
      id: '1',
      studentId: '2'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return UNAUTHORIZED if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await penRequestBatch.getPenRequestBatchStudentMatchOutcome(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return data if success', async () => {
    const matchResponse = [
      { matchedStudentId: '1' },
      { matchedStudentId: '2' },
      { matchedStudentId: '3' },
      { matchedStudentId: '4' },
    ];
    const studentResponses = [
      {
        'studentID':'1',
        'pen':'104935655',
        'legalFirstName':'Johns',
        'legalMiddleNames':'The',
        'legalLastName':'Man',
        'dob':'1983-10-06',
        'sexCode':'M',
        'genderCode':'M',
        'usualFirstName':'Total',
        'usualMiddleNames':'Awesome',
        'usualLastName':'Guy',
        'email':null,
        'emailVerified':'N',
        'deceasedDate':null,
        'postalCode':'V0X1C5',
        'mincode':'10200015',
        'localID':null,
        'gradeCode':'12',
        'gradeYear':'0',
        'demogCode':'F',
        'statusCode':'A',
        'memo':null
      },
      {
        'studentID':'2',
        'pen':'114178973',
        'legalFirstName':'Inspector',
        'legalMiddleNames':'Space',
        'legalLastName':'Time',
        'dob':'1994-04-16',
        'sexCode':'F',
        'genderCode':'F',
        'usualFirstName':'Inspector',
        'usualMiddleNames':'Space',
        'usualLastName':'Time',
        'email':null,
        'emailVerified':'N',
        'deceasedDate':null,
        'postalCode':'V1K2K2',
        'mincode':'03535029',
        'localID':null,
        'gradeCode':'07',
        'gradeYear':'0',
        'demogCode':'F',
        'statusCode':'A',
        'memo':null
      },
      {
        'studentID':'3',
        'pen':'118604461',
        'legalFirstName':'PETER',
        'legalMiddleNames':'MEGAN',
        'legalLastName':'STEWIE',
        'dob':'1997-12-18',
        'sexCode':'M',
        'genderCode':'M',
        'usualFirstName':'LOIS',
        'usualMiddleNames':'CHRIS',
        'usualLastName':'BRIAN',
        'email':null,
        'emailVerified':'N',
        'deceasedDate':null,
        'postalCode':'V4C3M6',
        'mincode':'00807025',
        'localID':null,
        'gradeCode':'12',
        'gradeYear':'0',
        'demogCode':'A',
        'statusCode':'A',
        'memo':null
      },
      {
        'studentID':'4',
        'pen':'107823999',
        'legalFirstName':'Names',
        'legalMiddleNames':'Are',
        'legalLastName':'Hard',
        'dob':'1991-12-09',
        'sexCode':'F',
        'genderCode':'F',
        'usualFirstName':'To',
        'usualMiddleNames':'Think',
        'usualLastName':'Of',
        'email':null,
        'emailVerified':'N',
        'deceasedDate':null,
        'postalCode':'V0T1N5',
        'mincode':'10200006',
        'localID':null,
        'gradeCode':'11',
        'gradeYear':'0',
        'demogCode':'F',
        'statusCode':'A',
        'memo':null
      }
    ];
    utils.getData.mockResolvedValueOnce(matchResponse);
    studentResponses.forEach((response) => {
      utils.getData.mockResolvedValueOnce(response);
    });
    await penRequestBatch.getPenRequestBatchStudentMatchOutcome(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(studentResponses);
  });

  it('should return empty array if no matches', async () => {
    const matchResponse = [];
    utils.getData.mockResolvedValueOnce(matchResponse);
    await penRequestBatch.getPenRequestBatchStudentMatchOutcome(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(matchResponse);
  });

  it('should return error if match call errors', async () => {
    utils.getData.mockRejectedValue(new Error('Test error'));

    await penRequestBatch.getPenRequestBatchStudentMatchOutcome(req,res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return error if student call errors', async () => {
    const matchResponse = [
      { matchedStudentId: '1' },
      { matchedStudentId: '2' },
      { matchedStudentId: '3' },
      { matchedStudentId: '4' },
    ];
    utils.getData.mockResolvedValueOnce(matchResponse);
    utils.getData.mockRejectedValue(new Error('Test error'));

    await penRequestBatch.getPenRequestBatchStudentMatchOutcome(req,res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

