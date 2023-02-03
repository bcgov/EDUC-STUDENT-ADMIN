//utils function for institutes displays for status (schools and authorities only)
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';

//helper function for getStatusColor
const getContactStatus = function (contact) {
  const currentDate = LocalDateTime.now();
  let effectiveDate = contact.effectiveDate;
  let expiryDate = contact.expiryDate;
  let status = null;

  const parsedEffectiveDate = new LocalDateTime.parse(effectiveDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));

  let parsedExpiryDate = null;
  if (expiryDate) {
    parsedExpiryDate = new LocalDateTime.parse(expiryDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
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

/**
 * Determines obtains status color for contacts
 * Used in school, district and authority contact pages
 * @param expiryDate
 * @returns Boolean
 */
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

/**
 * Determines whether contact is expired
 * Used in school, district and authority contact pages
 * @param expiryDate
 * @returns Boolean
 */
export function isExpired(expiryDate) {
  const currentDate = LocalDateTime.now();
  let parsedExpiryDate = null;
  let expired = false;

  if (expiryDate) {
    parsedExpiryDate = new LocalDateTime.parse(expiryDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
  }

  if (expiryDate !== null && parsedExpiryDate < currentDate) {
    expired = true;
  }

  return expired;
}

/**
 * Determines whether a contact is current.
 * @param contact
 * @returns Boolean
 */
export function isContactCurrent(contact) {
  const currentTimestamp = LocalDateTime.now();
  const parsedEffectiveDate = new LocalDateTime.parse(contact.effectiveDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
  const parsedExpiryDate = contact.expiryDate ? new LocalDateTime.parse(contact.expiryDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss')) : null;
  if (parsedEffectiveDate > currentTimestamp) {
    return false;
  }
  return parsedExpiryDate == null || parsedExpiryDate > currentTimestamp;
}

/**
 * Provides status text for schools and authorities NOT districts
 * Used in school and authority list, details pages
 * Note * Authorities will only have Open Closing Closed states
 * @param expiryDate
 * @returns String (Never Opened, Open, Opening, Closing, Closed)
 */
export function getStatusAuthorityOrSchool(authorityOrSchool) {
  const currentDate = LocalDateTime.now();
  let openedDate = authorityOrSchool.openedDate;
  let closedDate = authorityOrSchool.closedDate;

  if (!openedDate) {
    openedDate = authorityOrSchool.effectiveDate;
    closedDate = authorityOrSchool.expiryDate;
    if(!openedDate){
      return 'Never Opened';
    }
  }

  const parsedOpenDate = new LocalDateTime.parse(openedDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));

  let parsedCloseDate = null;
  if(closedDate){
    parsedCloseDate = new LocalDateTime.parse(closedDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
  }

  if (parsedOpenDate <= currentDate && parsedCloseDate === null) {
    return 'Open';
  } else if (parsedOpenDate > currentDate) {
    return 'Opening';
  } else if (parsedOpenDate <= currentDate && parsedCloseDate > currentDate) {
    return 'Closing';
  }

  return 'Closed';
}

/**
 * Provides status color for Schools and Authorities
 * Used in School and Authority list, details pages
 * Note * Authorities will only have Open Closing Closed states
 * @param status
 * @returns String
 */
export function getStatusColorAuthorityOrSchool(statusText) {
  if (statusText === 'Open') {
    return 'green';
  } else if (statusText === 'Opening'){
    return 'blue';
  } else if (statusText === 'Closing'){
    return 'orange';
  } else if (statusText === 'Closed') {
    return 'red';
  } else if (statusText === 'Never Opened') {
    return 'grey';
  }
}
