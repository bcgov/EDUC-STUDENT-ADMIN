const HttpStatus = require('http-status-codes');
const student = require('../../../src/components/student');
jest.mock('../../../src/components/utils');
const {mockRequest, mockResponse} = require('../helpers');
const utils = require('../../../src/components/utils');
const {ApiError} = require('../../../src/components/error');

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
    expect(res.json).toHaveBeenCalledWith({student: {}, merges: [], possibleMatches: []});
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
