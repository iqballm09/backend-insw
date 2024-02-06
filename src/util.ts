import { HttpException, HttpStatus } from '@nestjs/common';

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
