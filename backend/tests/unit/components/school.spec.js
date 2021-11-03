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
jest.mock('../../../src/components/cache-service');
const cacheService = require('../../../src/components/cache-service');
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');
const { ApiError } = require('../../../src/components/error');
const school = require('../../../src/components/school');
const {LocalDateTime} = require('@js-joda/core');


describe('getPenCoordinators', () => {
  let req;
  let res;
  const coords = [
    {mincode: '00200001', penCoordinatorName: 'coord A'},
    {mincode: '00100001', penCoordinatorName: 'coord B'},
  ];

  const formattedResponse = [
    {mincode: '00100001', penCoordinatorName: 'coord B', schoolName: 'School A'},
    {mincode: '00200001', penCoordinatorName: 'coord A', schoolName: 'School A'},
  ];


  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all coords correctly', async () => {
    utils.getData.mockResolvedValue(coords);
    cacheService.getSchoolNameJSONByMincode.mockReturnValue({schoolName: 'School A', effectiveDate: LocalDateTime.now().minusMinutes(2).toJSON()});
    await school.getPenCoordinators(req,res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(formattedResponse);
  });
  it('should return 500 if getData fails', async () => {
    utils.getData.mockRejectedValue(new ApiError());

    await school.getPenCoordinators(req,res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'INTERNAL SERVER ERROR'});
  });
});
