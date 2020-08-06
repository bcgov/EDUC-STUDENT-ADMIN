import axios from 'axios';
import { Routes } from '../utils/constants';

export default {

  //Retrieves an auth token from the API endpoint
  async getAuthToken() {
    try {
      const response = await axios.get(Routes.TOKEN);

      return response.data;
    } catch (e) {
      console.log(`Failed to acquire JWT token - ${e}`); // eslint-disable-line no-console
      throw e;
    }
  },

  //Refreshes the users auth token
  async refreshAuthToken(token) {
    try {
      const response = await axios.post(Routes.REFRESH, {
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
