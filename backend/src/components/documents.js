'use strict';
const { getBackendToken, getData, putData, logApiError, getUser, isPdf } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const file = require('./file');
const log = require('./logger');

function getDocuments(requestType) {
  return function getDocumentsHandler(req, res) {
    try{
      const token = getBackendToken(req, res);
      if(!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      getData(token,`${config.get(`server:${requestType}:rootURL`)}/${req.params.id}/documents`)
        .then((documentsResponse) => {
          const results=[];
          for(const element of documentsResponse)  {
            if(element.fileSize) {
              element.fileSize = file.humanFileSize(element.fileSize);
            }
            results.push(element);
          }
          return res.status(200).json(results);
        })
        .catch(e => {
          logApiError(e, 'getDocuments', 'Error occurred while attempting to GET documents.');
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'INTERNAL SERVER ERROR'
          });
        });
    } catch(e) {
      logApiError(e, 'getDocuments', 'Error occurred while attempting to GET documents.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }
  };
}

function getDocumentById(requestType) {
  return async function getDocumentByIdHandler(req, res) {
    const token = getBackendToken(req);
    const url = `${config.get(`server:${requestType}:rootURL`)}/${req.params.id}/documents/${req.params.documentId}`;
    getData(token, url).then(resData =>{
      res.setHeader('Content-type', resData.fileExtension);
      if(!isPdf(resData)){
        res.setHeader('Content-disposition', 'attachment; filename=' + resData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
        return res.status(200).send(resData.documentData);
      }else{
        res.setHeader('Content-disposition', 'inline; filename=' + resData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
        return res.status(200).send(Buffer.from(resData.documentData, 'base64'));
      }
    }).catch(error=>{
      log.error('An error occurred attempting to get documents.');
      log.error(error);
      return res.status(500).json();
    });
  };
}

function updateDocumentTypeById(requestType) {
  return async function updateDocumentTypeByIdHandler(req, res) {
    const token = getBackendToken(req, res);
    if(!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    const thisSession = req['session'];
    if (!thisSession.penRequest || thisSession.penRequest[`${requestType}ID`] !== req.params.id) {
      log.error(`Error attempting to update ${requestType}.  There is no request or different request stored in session.`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }

    try {
      const url = `${config.get(`server:${requestType}:rootURL`)}/${req.params.id}/documents/${req.params.documentId}`;

      let documentMetaData = await getData(token, url + '?includeDocData=N');

      const documentReq = {
        documentID: documentMetaData.documentID,
        documentTypeCode: req.body.documentTypeCode,
        fileName: documentMetaData.fileName,
        fileExtension: documentMetaData.fileExtension,
        fileSize: documentMetaData.fileSize
      };

      const documentRes = await putData(token, url, documentReq, getUser(req).idir_username);
      return res.status(200).json(documentRes);
    } catch(e) {
      logApiError(e, 'updateDocumentTypeById', 'Error updating a document.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }
  };
}

module.exports = {
  getDocuments,
  getDocumentById,
  updateDocumentTypeById
};
