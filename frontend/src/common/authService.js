import axios from 'axios';
import { Routes } from '../utils/constants';

export default {

  //Retrieves an auth token from the API endpoint
  async getAuthToken() {
    try {
      const response = await this.getAxios().get(Routes.TOKEN);

      return response.data;
    } catch (e) {
      console.log(`Failed to acquire JWT token - ${e}`); // eslint-disable-line no-console
      throw e;
    }
  },
  axiosInstance: null,
  getAxios(){
    if(this.axiosInstance === null){
      this.axiosInstance = axios;
      this.axiosInstance.defaults.withXSRFToken = true;
      this.axiosInstance.defaults.withCredentials = true;
      this.axiosInstance.defaults.xsrfCookieName = '_csrf';
      this.axiosInstance.defaults.xsrfHeaderName = 'X-CSRF-TOKEN';
    }
    return this.axiosInstance;
  },
  //Refreshes the users auth token
  async refreshAuthToken(token) {
    try {
      const response = await this.getAxios().post(Routes.REFRESH, {
        refreshToken: token
      });

      if(response.data.error){
        return {error: response.data.error_description};
      }
      
      return response.data;
    } catch (e) {
      console.log(`Failed to refresh JWT token - ${e}`); // eslint-disable-line no-console
      throw e;
    }
  }
};
