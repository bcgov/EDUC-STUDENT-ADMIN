//this mixin has helper functions to convert codes to Minteam names and School names.

import {mapState} from 'vuex';

export default {
  mounted() {
    this.$store.dispatch('app/getCodes');
    this.$store.dispatch('edx/getCodes');
  },
  computed: {
    ...mapState('edx', ['ministryTeams']),
    ...mapState('app', ['mincodeSchoolNames']),
  },
  methods: {
    getContactName(secureExchange) {
      let contactName = '';

      switch (secureExchange.secureExchangeContactTypeCode) {
      case 'MINTEAM' :
        if (this.ministryTeams.length > 0) {
          contactName = this.getMinistryTeamNameByID(secureExchange.ministryOwnershipTeamID);
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
      return (ministryTeam?.teamName || 'minteam not found');
    },
    getSchoolNameByMincode(mincode) {
      let schoolName = this.mincodeSchoolNames.get(mincode);
      return schoolName ? `${schoolName} (${mincode})` : 'school not found';
    }
  }
};
