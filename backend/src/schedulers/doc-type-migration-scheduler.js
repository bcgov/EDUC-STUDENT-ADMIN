'use strict';
const CronJob = require('cron').CronJob;
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getData, putData} = require('../components/utils');
const redisUtil = require('../util/redis/redis-utils');
const lodash = require('lodash');
const retry = require('async-retry');
const schedulerCronDocTypeMigration = config.get('scheduler:schedulerCronDocTypeMigration');
log.info(`The cron to migrate document type codes from GUMPI to student-api is :: ${schedulerCronDocTypeMigration}`);

async function getDigitalIdDocMetaMap(data, url) {
  const didMap = new Map();
  const docMetadataList = await getData(data.accessToken, url);
  log.info(`found ${docMetadataList.length} document metadata.`);
  if (docMetadataList && docMetadataList.length > 0) {
    for (const docMetadata of docMetadataList) {
      let docMetaList = [];
      const didMapValue = didMap.get(docMetadata.digitalID);
      if (didMapValue) {
        docMetaList = didMapValue;
        docMetaList.push(docMetadata);
        const docMetaListSorted = lodash.sortBy(docMetaList, ['createDate']);
        didMap.set(docMetadata.digitalID, docMetaListSorted);
      } else {
        docMetaList.push(docMetadata);
        didMap.set(docMetadata.digitalID, docMetaList);
      }
    }
  }
  return didMap;
}

async function migrateDocumentTypeCodeAndDateOfConfirmation(url, historyActivityCode){
  const data = await getApiCredentials(); // get the tokens first to make api calls.
  const didMap = await getDigitalIdDocMetaMap(data, url);
  log.info(`found ${didMap.size} unique dids for which system will process migration`);
  for(const did of didMap.keys()){
    const tokenData = await getApiCredentials(); // get the tokens first to make api calls.
    let digitalIDData= await getData(tokenData.accessToken, config.get('server:digitalIdURL') + '/' + did);
    if(digitalIDData?.studentID){
      let studentData = await getData(tokenData.accessToken, config.get('server:student:rootURL') + '/' + digitalIDData.studentID);
      if(!studentData.documentTypeCode){
        const docMetaList = didMap.get(did);
        let docTypeCode;
        let confirmationDate;
        if(docMetaList.length > 1){
          docTypeCode = docMetaList[docMetaList.length -1]?.documentTypeCode;
          confirmationDate = docMetaList[docMetaList.length -1]?.createDate;
        }else if(docMetaList.length === 1){
          docTypeCode = docMetaList[0].documentTypeCode;
          confirmationDate = docMetaList[0]?.createDate;
        }
        studentData.documentTypeCode = docTypeCode;
        studentData.dateOfConfirmation = confirmationDate;
        if (studentData.demogCode !== 'C') {
          studentData.demogCode = 'C';
        }
        studentData.historyActivityCode = historyActivityCode;
        delete studentData.createDate;
        delete studentData.updateDate;
        await retry(async () => {
          await putData(tokenData.accessToken, `${config.get('server:student:rootURL')}/${studentData.studentID}`, studentData, 'STUDENT-ADMIN');
        },
        {
          retries: 3
        });
      }else {
        log.info(`Document type code is already present for student :: ${studentData.studentID}`);
      }
    }else {
      log.warn(`student link was not found for digital id:: ${did}`);
    }
  }
  return didMap;
}
if(schedulerCronDocTypeMigration){ // if it is not configured do not execute.
  try {
    const migrateDocTypeCodesForGUMPI = new CronJob(schedulerCronDocTypeMigration, async () => {
      log.debug('starting migrateDocTypeCodesForGUMPI');
      const redLock = redisUtil.getRedLock();
      try {
        await redLock.lock('locks:migrateDocTypeCodesForGUMPI', 1000); // no need to release the lock as it will auto expire after 1000 ms.
        await retry(async () => {
          await migrateDocumentTypeCodeAndDateOfConfirmation(`${config.get('server:penRequest:rootURL')}/documents`,'GMP');
        },
        {
          retries: 5
        });
        await retry(async () => {
          await migrateDocumentTypeCodeAndDateOfConfirmation(`${config.get('server:studentRequest:rootURL')}/documents`,'UMP');
        },
        {
          retries: 5
        });


      }catch (e) {
        log.debug(`locks:migrateDocTypeCodesForGUMPI, check other pods. ${e}`);
      }
    });
    migrateDocTypeCodesForGUMPI.start();
  } catch (e) {
    log.error(e);
  }
}

