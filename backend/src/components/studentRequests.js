'use strict';
const { LocalDateTime } = require('@js-joda/core');

function createStudentRequestApiServiceReq(studentRequest, req) {
  studentRequest.pen = req.body.pen;
  studentRequest.studentRequestStatusCode = req.body.studentRequestStatusCode;
  studentRequest.reviewer = req.body.reviewer;
  studentRequest.failureReason = req.body.failureReason;
  studentRequest.completeComment = req.body.completeComment;
  studentRequest.demogChanged = req.body.demogChanged;
  if(req.body.statusUpdateDate) {
    studentRequest.statusUpdateDate = req.body.statusUpdateDate;
  }

  return studentRequest;
}

function createStudentRequestCommentApiServiceReq(req, userToken) {
  const request = {
    requestID: req.params.id,
    staffMemberIDIRGUID: userToken['preferred_username'].toUpperCase(),
    staffMemberName: userToken['idir_username'],
    commentContent: req.body.content,
    commentTimestamp: LocalDateTime.now().toString()
  };
  return request;
}

module.exports = {
  createStudentRequestApiServiceReq,
  createStudentRequestCommentApiServiceReq
};
