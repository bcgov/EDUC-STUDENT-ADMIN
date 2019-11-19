import axios from 'axios';
import ApiService from '@/common/apiService';
import AuthService from '@/common/authService';
import MockAdapter from 'axios-mock-adapter';
import { AuthRoutes } from '@/utils/constants.js';

const mockAxios = new MockAdapter(axios);


describe('authService.js', () => {
  const spy = jest.spyOn(ApiService.apiAxios, 'get');

  afterEach(() => {
    spy.mockClear();
  });

  it('Call get token endpoint', async () => {
    mockAxios.onGet(AuthRoutes.TOKEN).reply(200, {
      token: 'fakeToken'
    });
    const res = await AuthService.getAuthToken();
    expect(res.token).toBe('fakeToken');
  });

  it('Call refresh token endpoint', async () => {
    mockAxios.onPost(AuthRoutes.REFRESH).reply(200, {
      refreshToken: 'token',
      error: false
    });
    const res = await AuthService.refreshAuthToken('oldToken');
    expect(res.refreshToken).toBe('token');
  });


  it('Expect refreshToken to fail', async () => {
    mockAxios.onPost(AuthRoutes.REFRESH).reply(200, {
      refreshToken: 'token',
      error: true,
      error_description: 'test error'
    });
    try{
      await AuthService.refreshAuthToken('testToken');
    } catch(e) {
      expect(e).toEqual({error: 'test_error'});
    }
  });
  it('Expect getAuthToken to throw error', async () => {
    mockAxios.onGet(AuthRoutes.TOKEN).reply(function() {
      throw new Error('error');
    });
    expect(AuthService.getAuthToken()).rejects.toThrowError();
  });
  it('Expect getRefreshToken to throw error', async () => {
    mockAxios.onPost(AuthRoutes.REFRESH).reply(function() {
      throw Error;
    });
    expect(AuthService.refreshAuthToken('testToken')).rejects.toThrowError();
  });
});
