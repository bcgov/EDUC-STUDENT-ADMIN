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
    utils.getUser.mockResolvedValue({idir_username:'test'});
    utils.postData.mockRejectedValue('failed');

    await student.createNewStudent(req, res);
    expect(utils.getData).toHaveBeenCalledTimes(1);
    expect(req.session.create_new_student_transactionID).toBeDefined();
    expect(utils.errorResponse).toHaveBeenCalled();
  });

  it('should remove transaction id in session when create student success', async () => {
    utils.getData.mockResolvedValue('200000000');
    utils.getUser.mockResolvedValue({idir_username:'test'});
    utils.postData.mockResolvedValue({student:{}});

    await createStudentAndValidateExpectations(req, res);
  });
  it('should use transaction id already in session when create student failed last time', async () => {
    utils.getData.mockResolvedValue('200000000');
    utils.getUser.mockResolvedValue({idir_username:'test'});
    utils.postData.mockResolvedValue({student:{}});
    req.session.create_new_student_transactionID=uuidv4();
    await createStudentAndValidateExpectations(req, res);
  });

});

describe('getStudentTwinsByStudentId', () => {
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

  it('should return blank array if no data', async () => {
    utils.getData.mockResolvedValue([]);

    await student.getStudentTwinsByStudentId(req, res);
    expect(utils.getData).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith([]);
  });
  it('should return array with data if api returns data', async () => {
    utils.getData.mockResolvedValue([
      {
        createUser: 'STUDENT-ADMIN',
        updateUser: 'STUDENT-ADMIN',
        createDate: '2020-10-22T11:55:03',
        updateDate: '2020-10-22T11:55:03',
        studentTwinID: 'ac335fb0-7551-1327-8175-51aa19fa0001',
        studentID: 'ac335fb0-7551-1327-8175-51aa19ed0000',
        twinStudentID: 'ac33b3e3-744f-1b08-8174-4f98567f095b',
        studentTwinReasonCode: 'PENCREATE',

      },
      {
        createUser: 'STUDENT-ADMIN',
        updateUser: 'STUDENT-ADMIN',
        createDate: '2020-10-22T11:55:56',
        updateDate: '2020-10-22T11:55:56',
        studentTwinID: 'ac335fb0-7551-1327-8175-51aae9700003',
        studentID: 'ac335fb0-7551-1327-8175-51aa19ed0000',
        twinStudentID: 'ac335fb0-7551-1327-8175-51aae96f0002',
        studentTwinReasonCode: 'PENCREATE',

      }
    ]);

    await student.getStudentTwinsByStudentId(req, res);
    expect(utils.getData).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith([
      {
        createUser: 'STUDENT-ADMIN',
        updateUser: 'STUDENT-ADMIN',
        createDate: '2020-10-22T11:55:03',
        updateDate: '2020-10-22T11:55:03',
        studentTwinID: 'ac335fb0-7551-1327-8175-51aa19fa0001',
        studentID: 'ac335fb0-7551-1327-8175-51aa19ed0000',
        twinStudentID: 'ac33b3e3-744f-1b08-8174-4f98567f095b',
        studentTwinReasonCode: 'PENCREATE',

      },
      {
        createUser: 'STUDENT-ADMIN',
        updateUser: 'STUDENT-ADMIN',
        createDate: '2020-10-22T11:55:56',
        updateDate: '2020-10-22T11:55:56',
        studentTwinID: 'ac335fb0-7551-1327-8175-51aae9700003',
        studentID: 'ac335fb0-7551-1327-8175-51aa19ed0000',
        twinStudentID: 'ac335fb0-7551-1327-8175-51aae96f0002',
        studentTwinReasonCode: 'PENCREATE',

      }
    ]);
  });
  it('should return 500 if getData fails', async () => {
    utils.getData.mockRejectedValue(new ApiError());

    await student.getStudentTwinsByStudentId(req, res);
    expect(utils.errorResponse).toHaveBeenCalled();
  });
});
