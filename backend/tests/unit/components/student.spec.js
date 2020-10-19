const HttpStatus = require('http-status-codes');
const student = require('../../../src/components/student');
jest.mock('../../../src/components/utils');
const {mockRequest, mockResponse} = require('../helpers');
const utils = require('../../../src/components/utils');
const {ApiError} = require('../../../src/components/error');
const {v4: uuidv4} = require('uuid');
describe('getStudentByStudentId', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest({}, {id: '123'});
    res = mockResponse();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all data correctly', async () => {
    utils.getData.mockResolvedValue({});

    await student.getStudentByStudentId(req, res);
    expect(utils.getData).toHaveBeenCalledTimes(3);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({student: {}, merges: {}, twins: {}});
  });
  it('should return 500 if getData fails', async () => {
    utils.getData.mockRejectedValue(new ApiError());

    await student.getStudentByStudentId(req, res);
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

async function createStudentAndValidateExpectations(req, res) {
  await student.createNewStudent(req, res);
  expect(utils.getData).toHaveBeenCalledTimes(1);
  expect(utils.postData).toHaveBeenCalledTimes(1);
  expect(req.session.create_new_student_transactionID).toBeFalsy();
  expect(utils.errorResponse).toHaveBeenCalledTimes(0);
  expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
  expect(res.json).toHaveBeenCalledWith({student: {}});
}

describe('createNewStudent', () => {
  let req;
  let res;

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest({}, {id: '123'});
    req.body = {
      student: {
        legalFirstName: 'OM',
        legalLastName: 'MISHRA',
        postalCode: 'V8R4N4',
        localID: '000000000',
        sex: 'M',
        gender: 'M',
        mincode: '000000000'
      }
    };
    res = mockResponse();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should retain transaction id in session when create student fails', async () => {
    utils.getData.mockResolvedValue('200000000');
    utils.postData.mockRejectedValue('failed');

    await student.createNewStudent(req, res);
    expect(utils.getData).toHaveBeenCalledTimes(1);
    expect(req.session.create_new_student_transactionID).toBeDefined();
    expect(utils.errorResponse).toHaveBeenCalled();
  });

  it('should remove transaction id in session when create student success', async () => {
    utils.getData.mockResolvedValue('200000000');
    utils.postData.mockResolvedValue({student:{}});

    await createStudentAndValidateExpectations(req, res);
  });
  it('should use transaction id already in session when create student failed last time', async () => {
    utils.getData.mockResolvedValue('200000000');
    utils.postData.mockResolvedValue({student:{}});
    req.session.create_new_student_transactionID=uuidv4();
    await createStudentAndValidateExpectations(req, res);
  });

});
