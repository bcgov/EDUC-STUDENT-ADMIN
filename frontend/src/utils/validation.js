import {LocalDate, DateTimeFormatterBuilder, ResolverStyle} from '@js-joda/core';

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

export function isValidMinCode(code) {
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

