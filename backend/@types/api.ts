import { AxiosRequestConfig } from 'axios';
import { NextFunction, Request, Response } from 'express';

interface CachedMiddlewareResponse extends Omit<Response, 'send'> {
  send: (body: string) => void;
  sendResponse: (body: string) => void;
}

interface BaseStatusCode {
  description: string;
  displayOrder: number;
  effectiveDate: string;
  expiryDate: string;
  label: string;
}
interface PenRequestStatusCode extends BaseStatusCode {
  penRequestStatusCode: string;
}
interface StudentProfileStatusCode extends BaseStatusCode {
  studentRequestStatusCode: string;
}
interface StudentApiStatusCode extends BaseStatusCode {
  statusCode: string;
}
interface StudentApiGenderCode extends BaseStatusCode {
  genderCode: string;
}
interface StudentApiGradeCode extends BaseStatusCode {
  gradeCode: string;
}
interface StudentApiDemogCode extends BaseStatusCode {
  demogCode: string;
}

export interface RequestConfigWithToken extends AxiosRequestConfig {
  headers: {
    Authorization: string;
  }
}

export type StatusCode = PenRequestStatusCode
| StudentProfileStatusCode
| StudentApiStatusCode
| StudentApiGenderCode
| StudentApiGradeCode
| StudentApiDemogCode

export interface EdxDocument { fileName: string; }

export type CacheKey = 'identityTypeCodes'
| 'penStatusCodes'
| 'genderCodes'
| 'studentRequestStatusCodes';

export type CacheMiddleware = (req: Request, res: CachedMiddlewareResponse, next: NextFunction) => void;

/** Extend Express session data to possibly include penRequest data */
type PenRequest = { [key: string]: any }
declare module 'express-session' {
  interface SessionData {
    penRequest?: PenRequest;
    tempSessionExtensionIdentifier?: number;
  }
}
