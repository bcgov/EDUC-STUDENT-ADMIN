const HttpStatus = require('http-status-codes');
const penRequestBatch = require('../../../src/components/penRequestBatch');
jest.mock('../../../src/components/utils');
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

  jest.spyOn(utils, 'getBackendToken');
  jest.spyOn(utils, 'getData');
  jest.spyOn(utils, 'putData');


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
});

