const HttpStatus = require('http-status-codes');
const student = require('../../../src/components/student');
jest.mock('../../../src/components/utils');
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');
const { ApiError, ServiceError } = require('../../../src/components/error');

describe('getStudentByStudentId', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest({}, {id: "123"});
    res = mockResponse();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all data correctly', async () => {
    utils.getData.mockResolvedValue({});

    await student.getStudentByStudentId(req,res);
    expect(utils.getData).toHaveBeenCalledTimes(3);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({student: {}, merges: {}, twins: {}});
  });
  it('should return 500 if getData fails', async () => {
    utils.getData.mockRejectedValue(new ApiError());

    await student.getStudentByStudentId(req,res)
    expect(utils.errorResponse).toHaveBeenCalled();
  });
  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await student.getStudentByStudentId(req, res);
    expect(utils.unauthorizedError).toHaveBeenCalled();
  });
  it('should return INTERNAL_SERVER_ERROR error if no student record', async () => {
    utils.getData.mockResolvedValue(null);
    await student.getStudentByStudentId(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
