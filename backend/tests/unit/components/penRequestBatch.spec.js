const HttpStatus = require('http-status-codes');
jest.mock('../../../src/components/utils', () => {
  const originalModule = jest.requireActual('../../../src/components/utils');
  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    getBackendServiceToken: jest.fn(),
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
const SAGAS = require('../../../src/components/saga');
const auth = require('../../../src/components/auth');

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
    auth.getBackendServiceToken.mockReturnValue('token');
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

  jest.spyOn(auth, 'getBackendServiceToken');
  jest.spyOn(utils, 'getData');


  beforeEach(() => {
    auth.getBackendServiceToken.mockReturnValue('token');
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
    auth.getBackendServiceToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.params = {
      id: 'c0a8014d-74e1-1d99-8174-e10db81f0000',
      studentId: 'c0a8014d-74e1-1d99-8174-e10db8410001'
    };
    req.body = {
      twinStudentIDs,
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
    expectationsForUserActionsInPRBSaga(twinStudentIDs);
    expect(redisUtil.createSagaRecord).toHaveBeenCalledWith({
      sagaId: resp,
      penRequestBatchID: req.body.prbStudent.penRequestBatchID,
      penRequestBatchStudentID: req.params.studentId,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA'
    }, SAGAS.PEN_REQUEST_BATCH.sagaEventRedisKey);
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
  expect(utils.postData.mock.calls[0][1].mincode).toBe(prbStudentData.mincode);
  expect(utils.postData.mock.calls[0][1].matchedStudentIDList).toEqual(matchedStudentIDList);
  expect(utils.postData.mock.calls[0][1].createUser).toBeUndefined();
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
    utils.getData.mockImplementation((url) =>
      url.includes('possible-match') ? [{possibleMatchID: '801', matchedStudentID: '201'}, {possibleMatchID: '901', matchedStudentID: '301'}] : prbStudentData
    );
    utils.postData.mockResolvedValue(resp);
    await penRequestBatch.userMatchSaga(req, res);
    expectationsForUserActionsInPRBSaga(['202']);
    expect(utils.postData.mock.calls[0][1].gradeCode).toBe(prbStudentData.gradeCode);
    expect(redisUtil.createSagaRecord).toHaveBeenCalledWith({
      sagaId: resp,
      penRequestBatchID: req.body.prbStudent.penRequestBatchID,
      penRequestBatchStudentID: req.params.studentId,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA'
    }, SAGAS.PEN_REQUEST_BATCH.sagaEventRedisKey);
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
    auth.getBackendServiceToken.mockReturnValue('token');
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
    redisUtil.getSagaEventsByRedisKey.mockResolvedValue([`{
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
    redisUtil.getSagaEventsByRedisKey.mockResolvedValue([`{
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
    utils.getData.mockImplementation((url) =>
      url.includes('possible-match') ? [{possibleMatchID: '801', matchedStudentID: '201'}, {possibleMatchID: '901', matchedStudentID: '301'}] : prbStudentData
    );
    utils.postData.mockResolvedValue(resp);
    await penRequestBatch.userUnmatchSaga(req, res);
    expect(utils.postData.mock.calls[0][1].matchedStudentIDList).toEqual(['201']);
    expect(redisUtil.createSagaRecord).toHaveBeenCalledWith({
      sagaId: resp,
      penRequestBatchID: req.body.prbStudent.penRequestBatchID,
      penRequestBatchStudentID: req.params.studentId,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_SAGA'
    }, SAGAS.PEN_REQUEST_BATCH.sagaEventRedisKey);
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
  auth.getBackendServiceToken.mockReturnValue('token');
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
    const prep = prepArchiveAndReturnTests(req, res, penRequestBatchIDs);
    req = prep.req;
    res = prep.res;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all batch files if all success', async () => {
    const resp = penRequestBatchIDs.map(id => ({
      penRequestBatchID: id,
    }));
    utils.postData.mockImplementation((url, data) =>
      Promise.resolve(data)
    );
    await penRequestBatch.archiveFiles(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });


  it('should return error if all failed', async () => {
    utils.postData.mockImplementation(() =>
      Promise.reject({status: HttpStatus.INTERNAL_SERVER_ERROR})
    );
    await penRequestBatch.archiveFiles(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });


  it('should return all batch files if all success', async () => {
    const resp = penRequestBatchIDs.map(id => ({
      penRequestBatchID: id,
      penRequestBatchStatusCode: 'UNARCHIVED'
    }));

    utils.getData.mockResolvedValue(batchFiles);
    utils.putData.mockImplementation((url, data) =>
      Promise.resolve(data)
    );
    await penRequestBatch.unarchiveFiles(req, res);
    expect(utils.putData).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resp);
  });
  it('test_releaseBatchFilesForFurtherProcessing_shouldReturnAllBatchFilesWithStatusCodeLOADED_givenAllApiCallSuccess', async () => {
    const releaseResponse = penRequestBatchIDs.map(id => ({
      penRequestBatchID: id,
      penRequestBatchStatusCode: 'LOADED',
    }));
    utils.getData.mockResolvedValue(batchFiles);
    utils.putData.mockImplementation((url, data) =>
      Promise.resolve(data)
    );
    await penRequestBatch.releaseBatchFilesForFurtherProcessing(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(releaseResponse);
  });
});

function prepArchiveAndReturnTests(req, res, penRequestBatchIDs) {
  auth.getBackendServiceToken.mockReturnValue('token');
  req = mockRequest();
  res = mockResponse();
  req.body = {
    penRequestBatchIDs,
  };
  return { req: req, res: res };
}

describe('archiveAndReturnFiles', () => {
  let req;
  let res;
  const penRequestBatchIDs = ['c0a8014d-74e1-1d99-8174-e10db81f0001', 'c0a8014d-74e1-1d99-8174-e10db81f0002'];

  beforeEach(() => {
    const prep = prepArchiveAndReturnTests(req, res, penRequestBatchIDs);
    req = prep.req;
    res = prep.res;
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
    expect(utils.postData.mock.calls[0][1]).toEqual({penRequestBatchArchiveAndReturnSagaData: penRequestBatchIDs});
    expect(redisUtil.createSagaRecord).toHaveBeenCalledTimes(2);
    expect(redisUtil.createSagaRecord).toHaveBeenNthCalledWith(1,{
      sagaId: resp[0].sagaId,
      penRequestBatchStudentID: null,
      penRequestBatchID: resp[0].penRequestBatchID,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_TOPIC'
    }, SAGAS.PEN_REQUEST_BATCH.sagaEventRedisKey);
    expect(redisUtil.createSagaRecord).toHaveBeenNthCalledWith(2,{
      sagaId: resp[1].sagaId,
      penRequestBatchStudentID: null,
      penRequestBatchID: resp[1].penRequestBatchID,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_TOPIC'
    }, SAGAS.PEN_REQUEST_BATCH.sagaEventRedisKey);
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
