import {DateTimeFormatterBuilder, LocalDate, ResolverStyle} from '@js-joda/core';
import {groupBy, isPlainObject} from 'lodash';

const datePatternWithSlash = (new DateTimeFormatterBuilder).appendPattern('uuuu/MM/dd').toFormatter(ResolverStyle.STRICT);
export function checkDigit(pen) {
  const parsedPen = parseInt(pen);
  if(parsedPen === 0 || isNaN(parsedPen)){
    return false;
  }
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

export function isValidEndDate({ startDate, endDate }, delimiter = '/') {
  /*
  * is this just to compare if end date is a future date from start date
  * this does not validate the date itself
  * sample date: 2015/03/03, because joda uses dash so replacing delimiter (default is slash) to dash
  *
  * */

  // (startDate?.length && endDate?.length) is needed because on page load, both value would be null and statement will run
  if( (startDate?.length && endDate?.length) &&
      startDate?.length === endDate?.length ) {
    let parseJoda;
    if (endDate.length === 8) { // if the length is 8 then there was no delimiter used.
      const formatter = (new DateTimeFormatterBuilder).appendPattern('uuuuMMdd').toFormatter(ResolverStyle.STRICT);
      parseJoda = date => LocalDate.parse(date, formatter);
    } else {
      parseJoda = date => LocalDate.parse(date.replaceAll(delimiter, '-'));
    }
    if (parseJoda(endDate).isBefore(parseJoda(startDate))) {
      return false;
    }
  }
  return true;
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

export function isValidLength(length, required = true) {
  const rules = required ? [str => !!str || 'Required'] : [];
  return [ ...rules,
    str => (!str || (str && str.length <= length)) || 'Max ' + length + ' characters'
  ];
}

export function isValidNumber(evt) {
  let charCode = (evt.which) ? evt.which : evt.keyCode;
  if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
    evt.preventDefault();
  } else {
    return true;
  }
}

export function isValidEmail(value) {
  return !!(value && /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(value));
}
