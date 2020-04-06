'use strict';
const { getBackendToken, getData, getCodeTable, getCodeLabel, logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const file = require('./file');
const log = require('npmlog');

function getDocuments(req, res) {
  try{
    const token = getBackendToken(req, res);
    if(!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    return Promise.all([
      getData(token,`${config.get('server:penRequestURL')}/${req.params.id}/documents`),
      getCodeTable(token, 'documentTypeCodes', config.get('server:documentTypeCodesURL')),
    ])
      .then(([documentsResponse, documentTypeCodesResponse]) => {
        const results=[];
        for(const element of documentsResponse)  {
          if(element.fileSize) {
            element.fileSize = file.humanFileSize(element.fileSize);
          }
          if(!documentTypeCodesResponse) {
            log.error('Failed to get document type codes. Using code value instead of label.');
            element['documentTypeLabel'] = element['documentTypeCode'];
          } else {
            let label = getCodeLabel(documentTypeCodesResponse, 'documentTypeCode', element['documentTypeCode']);
            if(label) {
              element['documentTypeLabel'] = label;
            } else {
              log.error('Failed to get document type codes. Using code value instead of label.');
              element['documentTypeLabel'] = element['documentTypeCode'];
            }
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
}

async function getDocumentById(req, res) {
  const token = getBackendToken(req);
  if(!token){
    return res.status(401).json({
      status: 401,
      message: 'You are not authorised to access this page.'
    });
  }
  const url = `${config.get('server:penRequestURL')}/${req.params.id}/documents/${req.params.documentId}`;
  getData(token, url).then(resData =>{
    res.setHeader('Content-disposition', 'attachment; filename=' + resData.fileName);
    res.setHeader('Content-type', resData.fileExtension);
    return res.status(200).send(Buffer.from(resData.documentData, 'base64'));
  }).catch(error=>{
    log.error('An error occurred attempting to get documents.');
    log.error(error);
    return res.status(500).json();
  });
}

module.exports = {
  getDocuments,
  getDocumentById
};
