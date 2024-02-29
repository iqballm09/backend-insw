import { HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment-timezone';

export function validateError(error) {
  // Handle specific error cases if needed
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new HttpException(
      {
        statusCode: error.response.status,
        message: error.response.statusText,
      },
      error.response.status,
    );
  } else if (error.request) {
    // The request was made but no response was received
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'No response received from the server',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while processing the request',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export function getLocalTimeZone() {
  const userTimeZone = 'Asia/Jakarta';
  return userTimeZone;
}

export function generateNoReq(shippingType: string) {
  const randomNo = Math.floor(Math.random() * 10000) + 10000;
  const noReq =
    'LNSW' +
    moment(new Date()).format('YYYYMMDD').toString() +
    shippingType +
    randomNo.toString();
  return noReq;
}
