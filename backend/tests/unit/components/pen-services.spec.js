const HttpStatus = require('http-status-codes');
const penServices = require('../../../src/components/pen-services');
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
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');
const { ApiError } = require('../../../src/components/error');


describe('getMacros', () => {
  let req;
  let res;
  const macroObject = {label: 'data', createUser: 'user', macroId: '1', macroTypeCode: 'MERGE'};

  const formattedResponse = {
    mergeMacros: [{label: 'data', macroTypeCode: 'MERGE'}]
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

    await penServices.getMacros(req,res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(formattedResponse);
  });
  it('should return 500 if getData fails', async () => {
    utils.getData.mockRejectedValue(new ApiError());

    await penServices.getMacros(req,res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'INTERNAL SERVER ERROR'});
  });
});
