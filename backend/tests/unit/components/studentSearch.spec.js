const HttpStatus = require('http-status-codes');
const studentSearch = require('../../../src/components/studentSearch');
jest.mock('../../../src/components/utils');
const { mockRequest, mockResponse } = require('../helpers');
const utils = require('../../../src/components/utils');
const config = require('../../../src/config/index');
const { ApiError } = require('../../../src/components/error');

describe('searchStudent', () => {
  let req;
  let res;

  const expectApitoHaveBeenCalled = async (searchQueries, searchCriteriaList) => {
    const pageNumber = 0;
    const sort = {dob : 'ASC'};
    const params = {
      params: {
        pageNumber,
        sort,
        searchCriteriaList: searchCriteriaList
      }
    };
    req = mockRequest({}, {}, {pageNumber, sort, searchQueries});
    utils.getData.mockResolvedValue({});

    await studentSearch.searchStudent(req,res);
    expect(utils.getData).toHaveBeenCalledWith('token', config.get('server:student:rootURL') + '/paginated', params);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({});
  }

  beforeEach(() => {
    utils.getBackendToken.mockReturnValue('token');
    req = mockRequest();
    res = mockResponse();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call api with CONTAINS, STARTS_WITH or ENDS_WITH operation when wildcards at the start or end of name', async () => {
    await expectApitoHaveBeenCalled(
      '{"legalFirstName": "*on*", "legalMiddleNames": "Jan*", "legalLastName": "*son"}',
      '[{"searchCriteriaList":[{"key":"legalFirstName","condition":"AND","operation":"like","value":"ON","valueType":"STRING"},' + 
      '{"key":"legalMiddleNames","condition":"AND","operation":"starts_with","value":"JAN","valueType":"STRING"},' +
      '{"key":"legalLastName","condition":"AND","operation":"ends_with","value":"SON","valueType":"STRING"}]}]'
    );
  });

  it('should call api with BETWEEN operation when dob in searchQueries', async () => {
    await expectApitoHaveBeenCalled(
      '{"dob": {"startDate": "2010/01/01"}}',
      '[{"searchCriteriaList":[{"key":"dob","condition":"AND","operation":"btn","value":"2010-01-01,2010-01-01","valueType":"DATE"}]}]'
    );
  });

  it('should call api with CONTAINS_IGNORE_CASE operation when memo in searchQueries', async () => {
    await expectApitoHaveBeenCalled(
      '{"memo": "test memo"}',
      '[{"searchCriteriaList":[{"key":"memo","condition":"AND","operation":"like_ignore_case","value":"test memo","valueType":"STRING"}]}]'
    );
  });

  it('should remove spaces in the value when postalCode in searchQueries', async () => {
    await expectApitoHaveBeenCalled(
      '{"postalCode": "V1P 3M7"}',
      '[{"searchCriteriaList":[{"key":"postalCode","condition":"AND","operation":"starts_with","value":"V1P3M7","valueType":"STRING"}]}]'
    );
  });

  it('should return 500 if getData fails', async () => {
    utils.getData.mockRejectedValue(new ApiError());

    await studentSearch.searchStudent(req,res)
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return unauthorized error if no token', async () => {
    utils.getBackendToken.mockReturnValue(null);
    await studentSearch.searchStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
});
