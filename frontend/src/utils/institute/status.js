//utils function for institutes displays for status (schools and authorities only)
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

//helper function for getStatusColor
const getContactStatus = function (contact) {
  const currentDate = LocalDate.now();
  let effectiveDate = contact.effectiveDate;
  let expiryDate = contact.expiryDate;
  let status = null;

  const parsedEffectiveDate = new LocalDate.parse(effectiveDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));

  let parsedExpiryDate = null;
  if (expiryDate) {
    parsedExpiryDate = new LocalDate.parse(expiryDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
  }
  if (parsedExpiryDate === null && parsedEffectiveDate < currentDate) {
    status = 'Active';
  } else if (parsedEffectiveDate > currentDate) {
    status = 'Pending Start Date';
  } else if (parsedExpiryDate > currentDate) {
    status = 'Pending End Date';
  }
  return status;
};

export function getStatusColor(contact) {
  let status = getContactStatus(contact);
  if (status === 'Active') {
    return '#A9D18E';
  } else if (status === 'Pending Start Date'){
    return '#9DC3E6';
  } else if (status === 'Pending End Date'){
    return '#F4B183';
  }
}

