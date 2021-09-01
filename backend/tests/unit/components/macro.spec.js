const HttpStatus = require('http-status-codes');
const { mockRequest, mockResponse } = require('../helpers');
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
const utils = require('../../../src/components/utils');
const redisUtil = require('../../../src/util/redis/redis-utils');
const macro = require('../../../src/components/macro');
const { ApiError } = require('../../../src/components/error');
const SAGAS = require('../../../src/components/saga');

describe('updateMacroByMacroId', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest({}, {macroId: '3'});
    res = mockResponse();
    req.body = {macroText: 'new macro', macroTypeCode: 'MOREINFO', macroId: '3'};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return sagaId', async () => {
    utils.postData.mockResolvedValue('sagaId');

    await macro.updateMacroByMacroId(req, res);
    expect(redisUtil.createSagaRecord).toHaveBeenCalledWith({
      sagaId: 'sagaId',
      macroId: '3',
      sagaStatus: 'INITIATED',
      sagaName: 'MACRO_UPDATE_SAGA'
    }, SAGAS.MACRO.sagaEventRedisKey);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith('sagaId');
  });
  it('should return INTERNAL_SERVER_ERROR if putData exceptions thrown', async () => {
    utils.putData.mockRejectedValue(new ApiError('test error senario'))
    await macro.createMacro(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('createMacro', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    utils.getData.mockResolvedValue([
      {macroText: 'data', macroId: '1', macroCode: 'ABC', macroTypeCode: 'MOREINFO'},
      {macroText: 'data', macroId: '2', macroCode: 'DEF', macroTypeCode: 'REJECT'}
    ]);
    req = mockRequest();
    res = mockResponse();
    req.body = {macroText: 'new macro', macroTypeCode: 'MOREINFO'};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return new macro data', async () => {
    utils.postData.mockResolvedValue('sagaId');

    await macro.createMacro(req, res);
    expect(redisUtil.createSagaRecord).toHaveBeenCalledWith({
      sagaId: 'sagaId',
      macroId: null,
      sagaStatus: 'INITIATED',
      sagaName: 'MACRO_CREATE_SAGA'
    }, SAGAS.MACRO.sagaEventRedisKey);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith('sagaId');
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    utils.getData.mockRejectedValue(new ApiError('test error senario'));
    await macro.createMacro(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if postData exceptions thrown', async () => {
    utils.postData.mockRejectedValue(new ApiError('test error senario'))
    await macro.createMacro(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
