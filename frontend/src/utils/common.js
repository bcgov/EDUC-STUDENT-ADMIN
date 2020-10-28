'use strict';
import ApiService from "../common/apiService";
import {Routes} from "@/utils/constants";
const clone = require('rfdc')();
export function constructPenMatchObjectFromStudent(student) {
  return {
    surname: student.legalLastName,
    givenName: student.legalFirstName,
    middleName: student.legalMiddleNames,
    usualSurname: student.usualLastName,
    usualGiven: student.usualFirstName,
    usualMiddleName: student.usualMiddleNames,
    dob: student.dob,
    sex: student.genderCode,
    enrolledGradeCode: student.gradeCode,
    mincode: student.mincode,
    postal: student.postalCode
  };
}
export function getPossibleMatches(penMatch){
  return new Promise((resolve, reject) => {
    ApiService.apiAxios.post('api/penMatches/', penMatch)
      .then(response => {
        if (response.data && response.data.matchingRecords && response.data.matchingRecords.length > 0) {
          const studentIDs = response.data.matchingRecords.map((matchingRecord) => {
            return matchingRecord.studentID
          }).join();
          const params = {
            params: {
              studentIDs: studentIDs
            }
          };
          ApiService.apiAxios.get(Routes.student.GET_ALL_STUDENTS_BY_IDS, params)
            .then(result => {
              resolve(result.data);
            })
            .catch(error => {
              reject(error);
            });
        } else {
          resolve([]);
        }
      })
      .catch(error => {
        reject(error);
      });
  });

}

export function deepCloneObject(objectToBeCloned){
  return clone(objectToBeCloned);
}
