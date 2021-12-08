'use strict';

import {PEN_REQ_BATCH_STUDENT_REQUEST_CODES, Routes} from '@/utils/constants';
import {filter, isPlainObject, sortBy} from 'lodash';
import {getDateFormatter} from '@/utils/format';
import ApiService from '../common/apiService';
import {LocalDate} from '@js-joda/core';

const clone = require('rfdc')();

export function constructPenMatchObjectFromStudent(student) {
  return {
    pen: student.submittedPen,
    localID: student.localID,
    surname: student.legalLastName,
    givenName: student.legalFirstName,
    middleName: student.legalMiddleNames,
    usualSurname: student.usualLastName,
    usualGiven: student.usualFirstName,
    usualMiddleName: student.usualMiddleNames,
    dob: student.dob,
    sex: student.genderCode,
    enrolledGradeCode: student.gradeCode,
    mincode: student.mincode.replace(/\s/g, ''),
    postal: student.postalCode
  };
}

export function constructPenMatchObjectFromNominalRollStudent(nominalRollStudent) {
  return {
    surname: nominalRollStudent?.surname,
    givenName: nominalRollStudent?.givenNames,
    dob: nominalRollStudent?.birthDate?.replace(/-/g, ''),
    sex: nominalRollStudent?.gender,
    enrolledGradeCode: nominalRollStudent?.grade,
    mincode: nominalRollStudent?.schoolDistrictNumber + nominalRollStudent?.schoolNumber
  };
}

export function getPossibleMatches(penMatch) {
  return new Promise((resolve, reject) => {
    ApiService.apiAxios.post('/api/penMatches/', penMatch)
      .then(response => {
        if (response.data && response.data.matchingRecords && response.data.matchingRecords.length > 0) {
          const studentIDs = response.data.matchingRecords.map((matchingRecord) => {
            return matchingRecord.studentID;
          }).join();
          const params = {
            params: {
              studentIDs: studentIDs
            }
          };
          ApiService.apiAxios.get(Routes.student.GET_ALL_STUDENTS_BY_IDS, params)
            .then(result => {
              resolve({
                penStatus: response.data.penStatus,
                data: result.data
              });
            })
            .catch(error => {
              reject(error);
            });
        } else {
          resolve({
            penStatus: response.data.penStatus,
            data: []
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  });

}

export function deepCloneObject(objectToBeCloned) {
  return clone(objectToBeCloned);
}

export function getDemogValidationResults(student) {
  return new Promise((resolve, reject) => {
    ApiService.apiAxios.post(Routes.penServices.VALIDATE_DEMOGRAPHICS, student)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

/**
 * this function will only return the below structure
 String possibleMatchID;
 String studentID;
 String matchedStudentID;
 String matchReasonCode;
 <b>if student demographics information is needed, use the method getMatchedRecordssWithDemographicsByStudent.</b>
 * @param studentID
 * @returns {Promise<*[]>|Promise<unknown>}
 */
export function getMatchedRecordsByStudent(studentID) {
  if (studentID) {
    return new Promise((resolve, reject) => {
      ApiService.apiAxios.get(`${Routes.penMatch.POSSIBLE_MATCHES}/${studentID}`)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  } else {
    return Promise.resolve([]); // resolve blank array if student id is not present.
  }
}


/**
 * this function will return the demog details of matched students
 *
 <b>if student demographics information is not needed, use the method getMatchedRecordsByStudent.</b>
 * @param studentID
 * @param includingQueriedStudent
 * @returns {Promise<*[]>|Promise<unknown>}
 */
export async function getMatchedRecordssWithDemographicsByStudent(studentID, includingQueriedStudent=false) {
  if (studentID) {
    const possibleMatches = await ApiService.apiAxios.get(`${Routes.penMatch.POSSIBLE_MATCHES}/${studentID}`);
    const matchedStudentIDs = possibleMatches.data.map(match => match.matchedStudentID);
    const studentIDs = (includingQueriedStudent ? [studentID, ...matchedStudentIDs] : matchedStudentIDs).join();

    const params = {
      params: {
        studentIDs
      }
    };
    const { data: result } = await ApiService.apiAxios.get(Routes.student.GET_ALL_STUDENTS_BY_IDS, params);
    let matchedIndex = -1;

    result.forEach((item, index) => {
      if (item.studentID === studentID) {
        item.matchedToStudent = true;
        item.iconValue = 'mdi-file-check';
        matchedIndex = index;
      } else {
        item.possibleMatchedToStudent = true;
        item.iconValue = 'mdi-account-multiple';
      }
    });

    return matchedIndex > 0 ? [result[matchedIndex], ...result.slice(0, matchedIndex), ...result.slice(matchedIndex + 1)] : result;
  } else {
    return []; // resolve blank array if student id is not present.
  }
}

export function updatePossibleMatchResultsBasedOnCurrentStatus(prbStudent, possibleMatches, matchedStudentRecords) {
  if ((prbStudent?.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDUSR
    || prbStudent?.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDSYS
    || prbStudent?.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENSYS
    || prbStudent?.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR)
    && possibleMatches && possibleMatches.length > 0) {
    let matchedRecordNumber = 3.0;
    let newPossibleRecordNumber = 2.0;
    possibleMatches.forEach((item, index) => {
      if (item.studentID === prbStudent?.studentID) {
        item.matchedToStudent = true;
        item.iconValue = 'mdi-file-check';
        item.recordNum = 1; // it is expected to be executed only once
      } else if (matchedStudentRecords && filter(matchedStudentRecords, ['matchedStudentID', item.studentID]).length > 0) {
        item.possibleMatchedToStudent = true;
        matchedRecordNumber += .1;
        item.iconValue = 'mdi-account-multiple';
        item.recordNum = matchedRecordNumber;
      } else {
        item.iconValue = 'mdi-account-plus';
        newPossibleRecordNumber += .01;
        item.recordNum = newPossibleRecordNumber;
        item.newPossibleMatch = true;
      }
      possibleMatches[index] = item;
    });
    return sortBy(possibleMatches, ['recordNum']);
  } else {
    return deepCloneObject(possibleMatches);
  }
}

export function getSchoolData(mincode) {
  const params = {
    params: {
      mincode: mincode,
    }
  };
  if (mincode) {
    return new Promise((resolve, reject) => {
      ApiService.apiAxios
        .get(Routes.SCHOOL_DATA_URL, params)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  } else {
    return Promise.resolve(null);
  }
}

export function setEmptyInputParams(params, ...excludedParams) {
  Object.keys(params).forEach(key => {
    if(!excludedParams.includes(key)) {
      if(isPlainObject(params[key])) {
        setEmptyInputParams(params[key], ...excludedParams);
      } else {
        params[key] = null;
      }
    }
  });
}

export function equalsIgnoreCase(param1, param2) {
  return param1?.toLowerCase() === param2?.toLowerCase();
}

export function sortArrayByDate(array, dateFieldName, isAscending, datePattern = 'uuuuMMdd') {
  return array.sort((a, b) => {
    const dateA = getLocalDateFromString(a[`${dateFieldName}`].toString(), datePattern);
    const dateB = getLocalDateFromString(b[`${dateFieldName}`].toString(), datePattern);
    return isAscending ? dateA.compareTo(dateB) : dateB.compareTo(dateA);
  });
}

export const getLocalDateFromString = (date, pattern = 'uuuuMMdd') => {
  const formatter = getDateFormatter(pattern);
  try {
    return LocalDate.parse(date, formatter);
  } catch (e) {
    console.error(`Error is ${e}`);
  }
};

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * This function will return the first letter of each word in the camel case string, like "penRequestBatch" will return "prb"
 */
export function abbreviateCamelCase(string) {
  return string.replace(/([A-Z])/g,' $1').match(/\b(\w)/g).join('').toLowerCase();
}

