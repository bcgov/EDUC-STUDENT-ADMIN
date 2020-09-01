const HttpStatus = require('http-status-codes');
const requests = require('../../../src/components/requests');
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');

const penRequestStatusCodesData = [
  {
    'penRequestStatusCode': 'DRAFT',
    'label': 'Draft',
    'description': 'Request created but not yet submitted.',
    'displayOrder': 1,
    'effectiveDate': '2020-01-01T00:00:00',
    'expiryDate': '2099-12-31T00:00:00'
  }
];

describe('getCodes', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.__Rewire__('getBackendToken', () => 'token');
    utils.__Rewire__('getCodeTable', () => Promise.resolve(penRequestStatusCodesData));
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    requests.__ResetDependency__('getBackendToken');
    requests.__ResetDependency__('getCodeTable');
    jest.clearAllMocks();
  });
  it('should return codeTableData', async () => {
    await utils.getCodes('urlKey', 'cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestStatusCodesData);
  });
  it('should return unauthorized error if no token', async () => {
    utils.__Rewire__('getBackendToken', () => null);
    await utils.getCodes('urlKey', 'cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeTable exceptions thrown', async () => {
    utils.__Rewire__('getCodeTable', () => Promise.reject(new Error('test error senario')));
    await utils.getCodes('urlKey', 'cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
