const HttpStatus = require('http-status-codes');
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
    utils.__ResetDependency__('getBackendToken');
    utils.__ResetDependency__('getCodeTable');
    jest.clearAllMocks();
  });
  it('should return codeTableData', async () => {
    await utils.getCodes('urlKey', 'cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(penRequestStatusCodesData);
  });
  it('should return INTERNAL_SERVER_ERROR if getCodeTable exceptions thrown', async () => {
    utils.__Rewire__('getCodeTable', () => Promise.reject(new Error('test error senario')));
    await utils.getCodes('urlKey', 'cacheKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});


describe('getPaginatedListForSCGroups', () => {
  let req;
  let res;
  let handleResponse = jest.fn();
  const getPenRequestBatchStudents = utils.getPaginatedListForSCGroups('getPenRequestBatchStudents', 'http://localhost', handleResponse);

  beforeEach(() => {
    utils.__Rewire__('getBackendToken', () => 'token');
    utils.__Rewire__('getData', () => Promise.resolve({content: ['data']}));
    
    req = mockRequest();
    res = mockResponse();
    req.query = {
      pageNumber: 2,
      pageSize: 1,
      sort: {
        penRequestBatchStatusCode: 'DESC',
        mincode: 'ASC',
        submissionNumber: 'ASC'
      },
      searchQueries: [
        `{ 
          "searchCriteriaList": [
            {"key": "penRequestBatchStatusCode", "operation": "in", "value": "ACTIVE,UNARCHIVED", "valueType": "STRING"}
          ]
        }`,
      ]
    };
  });

  afterEach(() => {
    utils.__ResetDependency__('getBackendToken');
    utils.__ResetDependency__('getData');
    jest.clearAllMocks();
  });

  it('should call handleResponse if success', async () => {
    await getPenRequestBatchStudents(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(handleResponse).toHaveBeenCalledWith(['data']);
  });

});


describe('createMacro', () => {
  let req;
  let res;
  let macroCode;

  beforeEach(() => {
    utils.__Rewire__('getBackendToken', () => 'token');
    utils.__Rewire__('getData', () => Promise.resolve([
      {macroText: 'data', macroId: '1', macroCode: 'ABC', macroTypeCode: 'MOREINFO'},
      {macroText: 'data', macroId: '2', macroCode: 'DEF', macroTypeCode: 'REJECT'}
    ]));
    utils.__Rewire__('postData', (token, url, data) => Promise.resolve({...data, macroId: '3'}));
    req = mockRequest();
    res = mockResponse();
    req.body = {macroText: 'new macro', macroTypeCode: 'MOREINFO'};
  });

  afterEach(() => {
    utils.__ResetDependency__('getBackendToken');
    utils.__ResetDependency__('getData');
    utils.__ResetDependency__('postData');
    jest.clearAllMocks();
  });
  it('should return new macro data', async () => {
    await utils.createMacro('urlKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      macroText: 'new macro',
      macroTypeCode: 'MOREINFO',
      macroId: '3',
      macroCode: expect.stringMatching(/^[A-Z]{3}$/),
    }));
  });
  it('should return INTERNAL_SERVER_ERROR if getData exceptions thrown', async () => {
    utils.__Rewire__('getData', () => Promise.reject(new Error('test error senario')));
    await utils.createMacro('urlKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  it('should return INTERNAL_SERVER_ERROR if postData exceptions thrown', async () => {
    utils.__Rewire__('postData', () => Promise.reject(new Error('test error senario')));
    await utils.createMacro('urlKey')(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
