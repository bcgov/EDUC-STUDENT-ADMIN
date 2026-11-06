import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {setFailureAlert} from '@/components/composable/alertComposable';

export async function fetchActiveChallengeReportPeriod() {
  try {
    const response = await ApiService.apiAxios.get(Routes.challengeReports.ACTIVE_PERIOD);
    return response.data;
  } catch (error) {
    console.error(error);
    setFailureAlert(error?.response?.data?.message || 'An error occurred while trying to retrieve the status of Challenge Reports.');
    return null;
  }
}
