import {LocalDate, DateTimeFormatterBuilder, ResolverStyle} from '@js-joda/core';
import {groupBy, isPlainObject} from 'lodash';
import moment from 'moment';

const datePatternWithSlash = (new DateTimeFormatterBuilder).appendPattern('uuuu/MM/dd').toFormatter(ResolverStyle.STRICT);
export function checkDigit(pen) {
  const penDigits = [];

  for(let i = 0; i < pen.length; i++) {
    penDigits[i] = parseInt(pen.charAt(i), 10);
  }
  const S1 = penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 0;}).reduce((a,b) => a+b,0);
  const A = parseInt(penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 1;}).join(''), 10);
  const B = 2 * A;
  let S2 = B.toString().split('').map(Number).reduce(function (a, b) {return a + b;}, 0);
  const S3 = S1 + S2;
  if((S3 % 10) === 0) {
    return penDigits.pop() === 0;
  }
  return penDigits.pop() === (10 - (S3%10));
}

export function isValidPEN(pen) {
  return !!(pen && pen.length === 9 && checkDigit(pen));
}

export function isValidMincode(code) {
  return !!(code && code.match('^[0-9]\\d*$'));
}

export function isValidPostalCode(code) {
  return !!(code && code.match('^[abceghjklmnprstvxyABCEGHJKLMNPRSTVXY][0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ] {0,1}[0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ][0-9]$'));
}

export function isValidAlphanumericValue(value) {
  return !!(value && value.match('^[A-Za-z0-9]+$'));
}

export function isValidDob(dob, pattern='uuuu/MM/dd') {
  const formatter = (new DateTimeFormatterBuilder).appendPattern(pattern).toFormatter(ResolverStyle.STRICT);
  try {
    const dateObject = LocalDate.parse(dob, formatter);
    if(dateObject.isBefore(LocalDate.now())){
      return true;
    }
  }
  catch(err){
    //Do nothing
  }
  return false;
}

export function isValidEndDate(
  { startDate, endDate, hint = 'Must be after Date From'},
  button = null)
{
  /*
  * is this just to compare if end date is a future date from start date
  * this does not validate the date itself
  * sample date: 2021/03/15, doesn't have to be slashes, as long as works with moment
  *
  * button should consist of two keys components _this and field
  * sample: { _this: this, field: 'searchEnabled' }, this sample is from ArchivedRequestBatchDisplay.vue
  * _this passes the whole component to this function
  * field is the data field in that vue component we want to set to false
  * */
  if(startDate && endDate) {
    // length to be the same in order not to do checks everytime
    if(startDate.length === endDate.length) {
      // using moment's build-in function to do checks
      // cannot only use isBefore() because same date will return false
      // so using isSame() before isBefore() to check if dates are the same first
      if(moment(startDate).isSame(endDate)) return [];
      if(moment(endDate).isBefore(startDate)) {
        // if there's a button need to be disabled when validation fails
        if (button) button._this[button.field] = false;
        return [hint] ;
      }
    }
  }
  return [];
}

export function isDateAfter1900(dob, pattern='uuuu/MM/dd') {
  const formatter = (new DateTimeFormatterBuilder).appendPattern(pattern).toFormatter(ResolverStyle.STRICT);
  try {
    const dateObject = LocalDate.parse(dob, formatter);
    const dateBefore1900 = LocalDate.parse('1899/12/31',datePatternWithSlash);
    if(dateObject.isAfter(dateBefore1900)){
      return true;
    }
  }
  catch(err){
    //Do nothing
  }
  return false;
}

export function isPresentDateAndAfter1900(date, pattern='uuuu/MM/dd', includingCurrentDate=true) {
  const formatter = (new DateTimeFormatterBuilder).appendPattern(pattern).toFormatter(ResolverStyle.STRICT);
  try {
    const dateObject = LocalDate.parse(date, formatter);
    const dateBefore1900 = LocalDate.parse('1899/12/31', datePatternWithSlash);
    const maxDate = includingCurrentDate ? LocalDate.now().plusDays(1) : LocalDate.now();
    if( dateObject.isBefore(maxDate) && dateObject.isAfter(dateBefore1900)){
      return true;
    }
  }
  catch(err){
    //Do nothing
  }
  return false;
}

export function isValidDOBAndAfter1900(dob, pattern='uuuu/MM/dd') {
  return isPresentDateAndAfter1900(dob, pattern, false);
}

/**
 *
 * @param date1       iso date format   'yyyy-MM-ddThh:mm:ss'
 * @param date2       iso date format   'yyyy-MM-ddThh:mm:ss'
 * @returns {boolean}
 */
export function isOlderThan(date1, date2) {
  try {
    const dateObject1 = new Date(date1);
    const dateObject2 = new Date(date2);
    if(dateObject1.getTime() < dateObject2.getTime()){
      return true;
    }
  }
  catch(err){
    //Do nothing
    console.log(err);
  }
  return false;
}


export function isNotEmptyInputParams(obj) {
  const groups = groupBy(Object.values(obj), isPlainObject);
  return groups.false?.some(v => !!v) || groups.true?.some(v => isNotEmptyInputParams(v));
}
