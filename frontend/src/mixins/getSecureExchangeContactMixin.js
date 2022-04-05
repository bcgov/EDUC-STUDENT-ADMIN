//this mixin has functions to use the Secure Exchange object contact type code
//to render the correct contact name to display based on contact type code.
//whether it is a School or Minteam.
//ie SCHOOL -> take the contact identifier (UUID) to check the list of schools for the correct name

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
          let ministryTeam = this.ministryTeams.find((minTeam) => minTeam.ministryOwnershipTeamId === secureExchange.ministryOwnershipTeamID);
          contactName = ministryTeam?.teamName || 'minteam not found';
        }
        break;
      case 'SCHOOL' :
        if (this.mincodeSchoolNames.size > 0) {
          let schoolName = this.mincodeSchoolNames.get(secureExchange.contactIdentifier);
          contactName = schoolName ? `${schoolName} (${secureExchange.contactIdentifier})` : 'school not found';
        }
        break;
      default:
        console.error(
            `unable to process Secure Exchange Contact Type Code ${secureExchange.secureExchangeContactTypeCode}`);
        contactName = 'Contact Type Not Found';
      }

      return contactName;
    }
  }
};
