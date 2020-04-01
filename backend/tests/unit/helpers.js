'use strict';

const mockRequest = (session = {}) => {
  return {
    session,
  };
};

const mockResponse = () => {
  const res = {data: {}};
  res.status = jest.fn().mockImplementation((v) => {
    res.data.status = v;
    return res;
  });
  res.json = jest.fn().mockImplementation((v) => {
    res.data.json = v;
    return res; 
  });
  return res;
};

module.exports = {
  mockRequest,
  mockResponse,
};
