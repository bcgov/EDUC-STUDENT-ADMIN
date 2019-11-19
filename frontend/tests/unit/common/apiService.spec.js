//import axios from 'axios';
import ApiService from '@/common/apiService';

describe('apiService.js', () => {
  const spy = jest.spyOn(ApiService.apiAxios, 'get');

  beforeEach(() => {
    ApiService.apiAxios.interceptors.response.eject(ApiService.intercept);
  });
  afterEach(() => {
    spy.mockClear();
  });
  
  it('Set and Delete Auth header', () => {
    ApiService.setAuthHeader('randomToken');
    expect(ApiService.apiAxios.defaults.headers.common['Authorization']).toBe('Bearer randomToken');
    ApiService.setAuthHeader();
    expect(ApiService.apiAxios.defaults.headers.common['Authorization']).toBe(undefined);
  });

  it('process items in queue with error', () => {
    ApiService.failedQueue = ['itemA', 'itemB', 'itemC'];
    ApiService.processQueue(Error, null);
  });

  it('process items in queue with successful promise', () => {
    ApiService.failedQueue = ['itemA', 'itemB', 'itemC'];
    ApiService.processQueue(null, 'token');
  });
});
