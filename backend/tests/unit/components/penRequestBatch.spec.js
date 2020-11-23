const HttpStatus = require('http-status-codes');
jest.mock('../../../src/components/utils', () => {
  const originalModule = jest.requireActual('../../../src/components/utils');
  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    getBackendToken: jest.fn(),
    getData: jest.fn(),
    putData: jest.fn(),
    postData: jest.fn(),
  };
});
jest.mock('../../../src/util/redis/redis-utils');
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');
const redisUtil = require('../../../src/util/redis/redis-utils');
const penRequestBatch = require('../../../src/components/penRequestBatch');

const prbStudentData =
  {
    'penRequestBatchStudentID': 'c0a8014d-74e1-1d99-8174-e10db8410001',
    'penRequestBatchID': 'c0a8014d-74e1-1d99-8174-e10db81f0000',
    'penRequestBatchStudentStatusCode':'FIXABLE',
    'localID':'123456',
    'legalFirstName':'Ben',
    'minCode': '00807025',
    'createUser': 'PEN_REQUEST_BATCH_API'
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
    const studentResponses = require('./matchedStudents.json');
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

describe('issueNewPen', () => {
  let req;
  let res;
  const twinStudentIDs = ['201', '202'];

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.params = {
      id: 'c0a8014d-74e1-1d99-8174-e10db81f0000',
      studentId: 'c0a8014d-74e1-1d99-8174-e10db8410001'
    };
    req.body = {
      twinStudentIDs
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return sagaId if success', async () => {
    const resp = 'c0a8014d-74e1-1d99-8174-e10db8410003';
    utils.getData.mockResolvedValue(prbStudentData);
    utils.postData.mockResolvedValue(resp);
    await penRequestBatch.issueNewPen(req, res);
    expectationsForUserActionsInPRBSaga(twinStudentIDs);
    expect(redisUtil.createPenRequestBatchSagaRecordInRedis).toHaveBeenCalledWith({
      sagaId: resp,
      penRequestBatchStudentID: req.params.studentId,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA'
    });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should return INTERNAL_SERVER_ERROR if getData failed', async () => {
    utils.getData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.issueNewPen(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return INTERNAL_SERVER_ERROR if postData failed', async () => {
    utils.getData.mockResolvedValue(prbStudentData);
    utils.postData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.issueNewPen(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

function expectationsForUserActionsInPRBSaga(twinStudentIDs) {
  expect(utils.postData.mock.calls[0][2].mincode).toBe(prbStudentData.minCode);
  expect(utils.postData.mock.calls[0][2].twinStudentIDs).toEqual(twinStudentIDs);
  expect(utils.postData.mock.calls[0][2].createUser).toBeUndefined();
}

describe('user match saga', () => {
  let req;
  let res;

  beforeEach(() => {
    [req, res] = initializeMatchUnmatchTestData();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return sagaId if success', async () => {
    const resp = 'c0a8014d-74e1-1d99-8174-e10db8410003';
    utils.getData.mockImplementation((token, url) => 
      url.includes('twins') ? [{twinStudentID: '201'}, {twinStudentID: '301'}] : prbStudentData
    );
    utils.postData.mockResolvedValue(resp);
    await penRequestBatch.userMatchSaga(req, res);
    expectationsForUserActionsInPRBSaga(['202']);
    expect(redisUtil.createPenRequestBatchSagaRecordInRedis).toHaveBeenCalledWith({
      sagaId: resp,
      penRequestBatchStudentID: req.params.studentId,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA'
    });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should return INTERNAL_SERVER_ERROR if getData failed', async () => {
    utils.getData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.userMatchSaga(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return INTERNAL_SERVER_ERROR if postData failed', async () => {
    utils.getData.mockResolvedValue(prbStudentData);
    utils.postData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.userMatchSaga(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

describe('getPenRequestBatchStudentById', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.params = {
      id: 'c0a8014d-74e1-1d99-8174-e10db81f0000',
      studentId: 'c0a8014d-74e1-1d99-8174-e10db8410001'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true sagaInProgress if penRequestBatchStudentID in redis', async () => {
    utils.getData.mockResolvedValue(prbStudentData);
    redisUtil.getPenRequestBatchSagaEvents.mockResolvedValue([`{
      "sagaId": "c0a8014d-74e1-1d99-8174-e10db8410003",
      "penRequestBatchStudentID": "${prbStudentData.penRequestBatchStudentID}",
      "sagaStatus": "INITIATED"
    }`]);
    await penRequestBatch.getPenRequestBatchStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json.mock.calls[0][0].sagaInProgress).toBeTruthy();
    expect(res.json.mock.calls[0][0].repeatRequestOriginalStatus).toBe(prbStudentData.penRequestBatchStudentStatusCode);
  });

  it('should return false sagaInProgress if penRequestBatchStudentID not in redis', async () => {
    utils.getData.mockResolvedValue(prbStudentData);
    redisUtil.getPenRequestBatchSagaEvents.mockResolvedValue([`{
      "sagaId": "c0a8014d-74e1-1d99-8174-e10db8410003",
      "penRequestBatchStudentID": "c0a8014d-74e1-1d99-8174-e10db8419999",
      "sagaStatus": "INITIATED"
    }`]);
    await penRequestBatch.getPenRequestBatchStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json.mock.calls[0][0].sagaInProgress).toBeFalsy();
  });

  it('should return INTERNAL_SERVER_ERROR if getData failed', async () => {
    utils.getData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.getPenRequestBatchStudentById(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

describe('user unmatch saga', () => {
  let req;
  let res;

  beforeEach(() => {
    [req, res] = initializeMatchUnmatchTestData();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return sagaId if success', async () => {
    const resp = 'c0a8014d-74e1-1d99-8174-e10db8410004';
    utils.getData.mockResolvedValue(prbStudentData);
    utils.getData.mockImplementation((token, url) => 
      url.includes('twins') ? [{twinStudentID: '201', studentTwinID: '801'}, {twinStudentID: '301', studentTwinID: '901'}] : prbStudentData
    );
    utils.postData.mockResolvedValue(resp);
    await penRequestBatch.userUnmatchSaga(req, res);
    expect(utils.postData.mock.calls[0][2].studentTwinIDs).toEqual(['801']);
    expect(redisUtil.createPenRequestBatchSagaRecordInRedis).toHaveBeenCalledWith({
      sagaId: resp,
      penRequestBatchStudentID: req.params.studentId,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_SAGA'
    });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should return INTERNAL_SERVER_ERROR if getData failed', async () => {
    utils.getData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.userUnmatchSaga(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return INTERNAL_SERVER_ERROR if postData failed', async () => {
    utils.getData.mockResolvedValue(prbStudentData);
    utils.postData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.userUnmatchSaga(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

function initializeMatchUnmatchTestData() {
  const twinStudentIDs = ['201', '202'];
  utils.getBackendToken.mockReturnValue('token');
  const req = mockRequest();
  const res = mockResponse();
  req.params = {
    id: 'c0a8014d-74e1-1d99-8174-e10db81f0000',
    studentId: 'c0a8014d-74e1-1d99-8174-e10db8410001'
  };
  req.body = {
    matchedPEN: '123456789',
    twinStudentIDs
  };
  return [req, res, twinStudentIDs];
}
