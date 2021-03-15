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
    getUser: jest.fn().mockReturnValue({idir_username: 'User'})
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
    'mincode': '00807025',
    'gradeCode': '10',
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
  const matchedStudentIDList = ['201', '202'];

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.params = {
      id: 'c0a8014d-74e1-1d99-8174-e10db81f0000',
      studentId: 'c0a8014d-74e1-1d99-8174-e10db8410001'
    };
    req.body = {
      matchedStudentIDList,
      prbStudent: prbStudentData
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
    expectationsForUserActionsInPRBSaga(matchedStudentIDList);
    expect(redisUtil.createPenRequestBatchSagaRecordInRedis).toHaveBeenCalledWith({
      sagaId: resp,
      penRequestBatchStudentID: req.params.studentId,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA'
    });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should return INTERNAL_SERVER_ERROR if postData failed', async () => {
    utils.getData.mockResolvedValue(prbStudentData);
    utils.postData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.issueNewPen(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

function expectationsForUserActionsInPRBSaga(matchedStudentIDList) {
  expect(utils.postData.mock.calls[0][2].mincode).toBe(prbStudentData.mincode);
  expect(utils.postData.mock.calls[0][2].matchedStudentIDList).toEqual(matchedStudentIDList);
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
      url.includes('possible-match') ? [{possibleMatchID: '801', matchedStudentID: '201'}, {possibleMatchID: '901', matchedStudentID: '301'}] : prbStudentData
    );
    utils.postData.mockResolvedValue(resp);
    await penRequestBatch.userMatchSaga(req, res);
    expectationsForUserActionsInPRBSaga(['202']);
    expect(utils.postData.mock.calls[0][2].gradeCode).toBe(prbStudentData.gradeCode);
    expect(redisUtil.createPenRequestBatchSagaRecordInRedis).toHaveBeenCalledWith({
      sagaId: resp,
      penRequestBatchStudentID: req.params.studentId,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA'
    });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
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
      url.includes('possible-match') ? [{possibleMatchID: '801', matchedStudentID: '201'}, {possibleMatchID: '901', matchedStudentID: '301'}] : prbStudentData
    );
    utils.postData.mockResolvedValue(resp);
    await penRequestBatch.userUnmatchSaga(req, res);
    expect(utils.postData.mock.calls[0][2].matchedStudentIDList).toEqual(['201']);
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
  const matchedStudentIDList = ['201', '202'];
  utils.getBackendToken.mockReturnValue('token');
  const req = mockRequest();
  const res = mockResponse();
  req.params = {
    id: 'c0a8014d-74e1-1d99-8174-e10db81f0000',
    studentId: 'c0a8014d-74e1-1d99-8174-e10db8410001'
  };
  req.body = {
    prbStudent: prbStudentData,
    matchedPEN: '123456789',
    matchedStudentIDList
  };
  return [req, res, matchedStudentIDList];
}


describe('archive&unarchiveFiles&releaseBatchFilesForFurtherProcessing', () => {
  let req;
  let res;
  const penRequestBatchIDs = ['c0a8014d-74e1-1d99-8174-e10db81f0001', 'c0a8014d-74e1-1d99-8174-e10db81f0002'];
  const batchFiles = {
    content: penRequestBatchIDs.map(id => ({
      penRequestBatchID: id,
      penRequestBatchStatusCode: 'ACTIVE'
    }))
  };

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.body = {
      penRequestBatchIDs,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all batch files if all success', async () => {
    const resp = penRequestBatchIDs.map(id => ({
      penRequestBatchID: id,
      penRequestBatchStatusCode: 'ARCHIVED',
      processDate: expect.any(String)
    }));
    utils.getData.mockResolvedValue(batchFiles);
    utils.putData.mockImplementation((token, url, data) =>
      Promise.resolve(data)
    );
    await penRequestBatch.archiveFiles(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should return part of batch files if partial success', async () => {
    const penRequestBatchID = 'c0a8014d-74e1-1d99-8174-e10db81f0001';
    const resp = [{
      penRequestBatchID,
      penRequestBatchStatusCode: 'ARCHIVED',
      processDate: expect.any(String)
    }];
    utils.getData.mockResolvedValue(batchFiles);
    utils.putData.mockImplementation((token, url, data) =>
      data.penRequestBatchID === penRequestBatchID ? Promise.resolve(data) : Promise.reject({status: HttpStatus.INTERNAL_SERVER_ERROR})
    );
    await penRequestBatch.archiveFiles(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should return empty array if all failed', async () => {
    const resp = [];
    utils.getData.mockResolvedValue(batchFiles);
    utils.putData.mockImplementation(() =>
      Promise.reject({status: HttpStatus.INTERNAL_SERVER_ERROR})
    );
    await penRequestBatch.archiveFiles(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should return INTERNAL_SERVER_ERROR if getData failed', async () => {
    utils.getData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.archiveFiles(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return all batch files if all success', async () => {
    const resp = penRequestBatchIDs.map(id => ({
      penRequestBatchID: id,
      penRequestBatchStatusCode: 'UNARCHIVED',
      processDate: expect.any(String),
    }));

    utils.getData.mockResolvedValue(batchFiles);
    utils.putData.mockImplementation((token, url, data) =>
      Promise.resolve(data)
    );
    await penRequestBatch.unarchiveFiles(req, res);
    expect(utils.putData).toHaveBeenCalled();
    expect(utils.putData.mock.calls[0][2]).toEqual(resp[0]);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });
  it('test_releaseBatchFilesForFurtherProcessing_shouldReturnAllBatchFilesWithStatusCodeLOADED_givenAllApiCallSuccess', async () => {
    const releaseResponse = penRequestBatchIDs.map(id => ({
      penRequestBatchID: id,
      penRequestBatchStatusCode: 'LOADED',
      processDate: expect.any(String),
    }));
    utils.getData.mockResolvedValue(batchFiles);
    utils.putData.mockImplementation((token, url, data) =>
      Promise.resolve(data)
    );
    await penRequestBatch.releaseBatchFilesForFurtherProcessing(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(releaseResponse);
  });
});

describe('archiveAndReturnFiles', () => {
  let req;
  let res;
  const penRequestBatchIDs = ['c0a8014d-74e1-1d99-8174-e10db81f0001', 'c0a8014d-74e1-1d99-8174-e10db81f0002'];

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.body = {
      penRequestBatchIDs,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all batch files and saga ids', async () => {
    const resp = [
      {
        penRequestBatchID: 'c0a8014d-74e1-1d99-8174-e10db8410011',
        sagaId: 'c0a8014d-74e1-1d99-8174-e10db8410003'
      },
      {
        penRequestBatchID: 'c0a8014d-74e1-1d99-8174-e10db8410012',
        sagaId: 'c0a8014d-74e1-1d99-8174-e10db8410004'
      }];
    utils.postData.mockResolvedValue(resp);
    await penRequestBatch.archiveAndReturnFiles(req, res);
    expect(utils.postData.mock.calls[0][2]).toEqual({penRequestBatchIDs: penRequestBatchIDs});
    expect(redisUtil.createPenRequestBatchSagaRecordInRedis).toHaveBeenCalledTimes(2);
    expect(redisUtil.createPenRequestBatchSagaRecordInRedis).toHaveBeenNthCalledWith(1,{
      sagaId: resp[0].sagaId,
      penRequestBatchStudentID: resp[0].penRequestBatchID,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_TOPIC'
    });
    expect(redisUtil.createPenRequestBatchSagaRecordInRedis).toHaveBeenNthCalledWith(2,{
      sagaId: resp[1].sagaId,
      penRequestBatchStudentID: resp[1].penRequestBatchID,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_TOPIC'
    });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });

  it('should nothing given no batch ids provided', async () => {
    req.body = [];
    await penRequestBatch.archiveAndReturnFiles(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith();
  });

  it('should return INTERNAL_SERVER_ERROR if postData failed', async () => {
    utils.postData.mockRejectedValue(new Error('Test error'));
    await penRequestBatch.archiveAndReturnFiles(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
