import { test, expect } from '@jest/globals';
import * as moment from 'moment-timezone';

function generateNoReq(shippingType: string) {
  const randomNo = Math.floor(Math.random() * 10000) + 10000;
  const noReq =
    'LNSW' +
    moment(new Date()).format('YYYYMMDD').toString() +
    shippingType +
    randomNo.toString();
  return noReq;
}

describe('Create Request Number DO', () => {
  it('Check if Request DO Number contains "LNSW20240724YML"', () => {
    expect(generateNoReq('YML').substring(0, 15)).toEqual('LNSW20240724YML');
  });
  it('Check if Request DO Number contains "LNSW20240724EVG"', () => {
    expect(generateNoReq('EVG').substring(0, 15)).toEqual('LNSW20240724EVG');
  });
});
