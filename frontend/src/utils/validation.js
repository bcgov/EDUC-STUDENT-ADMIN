import {LocalDate, DateTimeFormatterBuilder, ResolverStyle} from '@js-joda/core';
import {groupBy, isPlainObject} from 'lodash';

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

export function isValidDOBAndAfter1900(dob, pattern='uuuu/MM/dd') {
  const formatter = (new DateTimeFormatterBuilder).appendPattern(pattern).toFormatter(ResolverStyle.STRICT);
  try {
    const dateObject = LocalDate.parse(dob, formatter);
    const dateBefore1900 = LocalDate.parse('1899/12/31', datePatternWithSlash);
    if(dateObject.isBefore(LocalDate.now()) && dateObject.isAfter(dateBefore1900)){
      return true;
    }
  }
  catch(err){
    //Do nothing
  }
  return false;
}

export function isOlderThan(date1, date2, pattern='uuuu/MM/dd') {
  const formatter = (new DateTimeFormatterBuilder).appendPattern(pattern).toFormatter(ResolverStyle.STRICT);
  try {
    const dateObject1 = LocalDate.parse(date1, formatter);
    const dateObject2 = LocalDate.parse(date2, formatter);
    if(dateObject1.isBefore(dateObject2)){
      return true;
    }
  }
  catch(err){
    //Do nothing
  }
  return false;
}


export function isNotEmptyInputParams(obj) {
  const groups = groupBy(Object.values(obj), isPlainObject);
  return groups.false?.some(v => !!v) || groups.true?.some(v => isNotEmptyInputParams(v));
}
