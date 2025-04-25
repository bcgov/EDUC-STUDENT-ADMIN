'use strict';
const { logApiError, getData, putData, handleExceptionResponse } = require('../utils');
const config = require('../../config');
const utils = require('../utils');
const cacheService = require('../cache-service');
const HttpStatus = require('http-status-codes');
const {FILTER_OPERATION, VALUE_TYPE} = require('../../util/constants');

async function getActiveReportingPeriod(req, res) {
  try {
    const url = `${config.get('server:gdc:activeReportingPeriodURL')}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getActiveReportingPeriod', 'Error occurred while attempting to GET GDC Active Reporting Period.');
    return handleExceptionResponse(e, res);
  }
}

async function getPreviousReportingPeriod(req, res) {
  try {
    const url = `${config.get('server:gdc:previousReportingPeriodURL')}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getPreviousReportingPeriod', 'Error occurred while attempting to GET GDC Previous Reporting Period.');
    return handleExceptionResponse(e, res);
  }
}

async function updateReportingPeriod(req, res) {
  try {
    const url = `${config.get('server:gdc:reportingPeriodURL')}`;
    const params = req.body;
    params.updateDate = null;
    params.createDate = null;
    params.updateUser = utils.getUser(req).idir_username;
    const data = await putData(url, params, utils.getUser(req).idir_username);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'updateReportingPeriod', 'Error occurred while attempting to UPDATE GDC Reporting Period.');
    if (
      e.status === 400 &&
      e.data?.reportingPeriodValidationErrors &&
      Array.isArray(e.data.reportingPeriodValidationErrors)
    ) {
      return res.status(400).json(e.data);
    }
    return handleExceptionResponse(e, res);
  }
}

async function getReportingSummary(req, res) {
  try {
    const params = {
      params: {
        type: req.query.type
      }
    };
    const url = `${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}/summary`;
    const data = await getData(url, params);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getReportingSummary', 'Error occurred while attempting to GET GDC Reporting summary.');
    return handleExceptionResponse(e, res);
  }
}

async function getFilesetsPaginated(req, res) {
  try {
    const search = [];

    if (req.query?.searchParams?.schoolID) {
      search.push({
        condition: 'AND',
        searchCriteriaList: [{ key: 'schoolID', value: req.query.searchParams.schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
      });
    }
    if (req.query?.searchParams?.pen) {
      search.push({
        condition: 'AND',
        searchCriteriaList: [
          { key: 'demographicStudentEntities.pen', value: req.query?.searchParams?.pen, operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING },
        ]
      });
    }

    if (req.query.searchParams?.collectionObject) {
      search.push({
        condition: 'AND',
        searchCriteriaList: [{
          key: 'reportingPeriod.reportingPeriodID',
          value: req.query.searchParams.collectionObject.reportingPeriodID,
          operation: FILTER_OPERATION.EQUAL,
          valueType: VALUE_TYPE.UUID
        }]
      });
    }

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(search),
      }
    };
    let data = await getData(`${config.get('server:gdc:filesetURL')}/paginated`, params);

    if (data.content && data.content.length > 0) {
      data.content = data.content.map(fileset => {
        if (req?.params?.districtID) {
          const school = cacheService.getSchoolBySchoolID(fileset.schoolID);
          fileset.schoolName = `${school.mincode} - ${school.schoolName}`.trim();
        }
        if (fileset.updateUser && fileset.updateUser.startsWith('EDX/')) {
          const userID = fileset.updateUser.slice(4);
          const user = cacheService.getEdxUserByID(userID);
          fileset.updateUser = user ? user.displayName : fileset.updateUser;
        }
        return fileset;
      });
    }

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError('Error getting error fileset paginated list', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getDemographicStudentByPenIncomingFilesetIdAndSchoolId(req, res) {
  try {
    const params = {
      params: {
        pen: req.params.pen,
        incomingFilesetID: req.params.filesetID,
        schoolID: req.query?.schoolID,
      }
    };

    let data = await getData(`${config.get('server:gdc:filesetURL')}/get-student`, params);

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError('Error getting error fileset object', e.stack);
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getActiveReportingPeriod,
  getPreviousReportingPeriod,
  updateReportingPeriod,
  getReportingSummary,
  getFilesetsPaginated,
  getDemographicStudentByPenIncomingFilesetIdAndSchoolId
};
