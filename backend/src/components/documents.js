'use strict';
const { getBackendToken, getData, getCodeTable, getCodeLabel, logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const file = require('./file');
const axios = require('axios');
const log = require('npmlog');

// async function getDocuments(req, res) {
//   const token = getBackendToken(req);
//   axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
//   const url = `${config.get('server:penRequestURL')}/${req.params.id}/documents`;
//   log.debug(`url is ${url}`);
//   axios.get(url).then(documentResponse =>{
//     const results=[];
//     for(const element of documentResponse.data)  {
//       if(element.fileSize)
//         element.fileSize = file.humanFileSize(element.fileSize);
//       results.push(element);
//     }
//     return res.status(200).json(results);
//   }).catch(error=>{
//     log.error('An error occurred attempting to get documents.');
//     log.error(error);
//     log.error(JSON.stringify(error.response.data));
//     return res.status(500).json();
//   });
// }

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
  axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
  const url = `${config.get('server:penRequestURL')}/${req.params.id}/documents/${req.params.documentId}`;
  log.debug(`url is ${url}`);
  axios.get(url).then(resData =>{
    res.setHeader('Content-disposition', 'attachment; filename=' + resData.data.fileName);
    res.setHeader('Content-type', resData.data.fileExtension);
    return res.status(200).send(Buffer.from(resData.data.documentData, 'base64'));
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
