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
  },
  {
    'penRequestStatusCode': 'INITREV',
    'label': 'First Review',
    'description': 'Request has been submitted and is now in it\'s first review by staff.',
    'displayOrder': 2,
    'effectiveDate': '2020-01-01T00:00:00',
    'expiryDate': '2099-12-31T00:00:00'
  },
  {
    'penRequestStatusCode': 'RETURNED',
    'label': 'Returned for more information',
    'description': 'Request has been returned to the submitter for more information.',
    'displayOrder': 3,
    'effectiveDate': '2020-01-01T00:00:00',
    'expiryDate': '2099-12-31T00:00:00'
  },
  {
    'penRequestStatusCode': 'SUBSREV',
    'label': 'Subsequent Review',
    'description': 'Request has been resubmitted with more info and is now in another review by staff.',
    'displayOrder': 4,
    'effectiveDate': '2020-01-01T00:00:00',
    'expiryDate': '2099-12-31T00:00:00'
  },
  {
    'penRequestStatusCode': 'AUTO',
    'label': 'Completed by auto-match',
    'description': 'Request was completed by the auto-match process, without staff review.',
    'displayOrder': 5,
    'effectiveDate': '2020-01-01T00:00:00',
    'expiryDate': '2099-12-31T00:00:00'
  },
  {
    'penRequestStatusCode': 'MANUAL',
    'label': 'Completed by manual match',
    'description': 'Request was completed by staff determining the matching PEN.',
    'displayOrder': 6,
    'effectiveDate': '2020-01-01T00:00:00',
    'expiryDate': '2099-12-31T00:00:00'
  },
  {
    'penRequestStatusCode': 'REJECTED',
    'label': 'Could not be fulfilled',
    'description': 'Request could not be fullfilled by staff for the reasons provided.',
    'displayOrder': 7,
    'effectiveDate': '2020-01-01T00:00:00',
    'expiryDate': '2099-12-31T00:00:00'
  },
  {
    'penRequestStatusCode': 'UNMATCHED',
    'label': 'Unable to match',
    'description': 'Request could not be matched to a PEN.',
    'displayOrder': 8,
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
