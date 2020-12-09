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
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');
const penTrax = require('../../../src/components/penTrax');

describe('getTraxDataByPen', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
    req.query = {
      pen: '123456789'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return trax data if Courses/Exams/Assmts', async () => {
    const student = {gradDate: 201306, studStatus: 'A'};
    utils.getData.mockImplementation((token, url) => 
      Promise.resolve(url.includes('students') ? student : {totalElements: 2})
    );
    await penTrax.getTraxDataByPen(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({traxStatus: 'A-Courses/Exams/Assmts', student});
  });

  it('should return Student not found if no student record', async () => {
    utils.getData.mockImplementation((token, url) => 
      url.includes('students') ? Promise.reject({status: HttpStatus.NOT_FOUND}) : Promise.resolve({totalElements: 2})
    );
    await penTrax.getTraxDataByPen(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({traxStatus: 'Student not found'});
  });

  it('should return trax data if no Courses/Exams/Assmts', async () => {
    const student = {gradDate: 201306, studStatus: 'A'};
    utils.getData.mockImplementation((token, url) => 
      Promise.resolve(url.includes('students') ? student : {totalElements: 0})
    );
    await penTrax.getTraxDataByPen(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({traxStatus: 'A-', student});
  });

  it('should return trax data if only Exams', async () => {
    const student = {gradDate: 201306, studStatus: 'A'};
    utils.getData.mockImplementation((token, url) => 
      Promise.resolve(url.includes('students') ? student : {totalElements: url.includes('prov-exams') ? 1 : 0})
    );
    await penTrax.getTraxDataByPen(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({traxStatus: 'A-Exams', student});
  });

  it('should return INTERNAL_SERVER_ERROR if getData failed', async () => {
    utils.getData.mockRejectedValue(new Error('Test error'));
    await penTrax.getTraxDataByPen(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

