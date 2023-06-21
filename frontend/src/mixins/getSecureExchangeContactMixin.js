//this mixin has helper functions to convert codes to Minteam names and School names.

import {mapState} from 'pinia';
import {edxStore} from '@/store/modules/edx';
import {appStore} from '@/store/modules/app';

export default {
  mounted() {
    appStore().getCodes();
    edxStore().getCodes();
  },
  computed: {
    ...mapState(edxStore, ['ministryTeams']),
    ...mapState(appStore, ['mincodeSchoolNames']),
  },
  methods: {
    getContactName(secureExchange) {
      let contactName = '';

      switch (secureExchange.secureExchangeContactTypeCode) {
      case 'MINTEAM' :
        if (this.ministryTeams.length > 0) {
          contactName = this.getMinistryTeamNameByID(secureExchange.contactIdentifier);
        }
        break;
      case 'SCHOOL' :
        if (this.mincodeSchoolNames.size > 0) {
          contactName = this.getSchoolNameByMincode(secureExchange.contactIdentifier);
        }
        break;
      default:
        console.error(`unable to process Secure Exchange Contact Type Code ${secureExchange.secureExchangeContactTypeCode}`);
        contactName = 'Contact Type Not Found';
      }

      return contactName;
    },
    getMinistryTeamNameByID(ministryOwnershipTeamID) {
      let ministryTeam = this.ministryTeams.find((minTeam) => minTeam.ministryOwnershipTeamId === ministryOwnershipTeamID);
      return ministryTeam ? ministryTeam?.teamName : 'Ministry team was not found';
    },
    getSchoolNameByMincode(mincode) {
      let schoolName = this.mincodeSchoolNames.get(mincode);
      return schoolName ? `${schoolName} (${mincode})` : 'school not found';
    }
  }
};
