import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
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

export const fonts = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Symbol: {
    normal: 'Symbol',
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats',
  },
};

export function jsonToBodyPdf(jsonData: any, type: string) {
  if (!['container', 'cargo'].includes(type)) {
    throw new BadRequestException(
      'Failed to generate DO File, type is not container or cargo.',
    );
  }

  let docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'potrait',
    pageMargins: [20, 30, 20, 30],
    styles: {
      headerTable: {
        fontSize: 12,
        bold: true,
      },
      headerCell: {
        fontSize: 11,
        bold: true,
        italics: true,
      },
    },
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 11,
      alignment: 'left',
    },
    content: [
      {
        table: {
          widths: '*',
          heights: 70,
          alignment: 'center',
          body: [
            [
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { qr: 'link', fit: '80', border: [true, true, true, true] },
            ],
          ],
        },
      },
      '\n\n',
      {
        table: {
          widths: [235, 145, 145],
          heights: 15,
          headerRows: 2,
          alignment: 'center',
          body: [
            [
              {
                text: jsonData.requestDetailForm.shippingLine,
                rowSpan: 2,
                style: 'headerTable',
                border: [true, true, true, false],
              },
              {
                text: 'Delivery Order',
                rowSpan: 2,
                alignment: 'center',
                style: 'headerTable',
                border: [true, true, true, false],
              },
              {
                text: 'BL No.',
                bold: true,
                style: 'headerTable',
                border: [true, true, true, false],
              },
            ],
            [
              '',
              '',
              {
                text: jsonData.requestDetailForm.blNumber,
                border: [false, false, true, false],
              },
            ],
            [
              {
                text: 'Notify Party',
                style: 'headerCell',
                border: [true, true, true, false],
              },
              {
                text: 'DO Number',
                style: 'headerCell',
                border: [true, true, true, false],
              },
              {
                text: 'DO Expired Date',
                style: 'headerCell',
                border: [true, true, true, false],
              },
            ],
            [
              {
                text: jsonData.partiesDetailForm.notifyPartyName,
                border: [true, false, true, false],
              },
              {
                text: jsonData.requestDetailForm.doReleaseNumber,
                border: [true, false, true, false],
              },
              {
                text: jsonData.requestDetailForm.doExp,
                border: [true, false, true, false],
              },
            ],
            [
              {
                text: jsonData.partiesDetailForm.notifyPartyNpwp,
                border: [true, false, false, false],
              },
              {
                text: 'Vessel',
                style: 'headerCell',
                border: [true, true, true, false],
              },
              {
                text: 'Voyage Number',
                style: 'headerCell',
                border: [true, true, true, false],
              },
            ],
            [
              { text: '', border: [true, false, true, true] },
              {
                text: jsonData.requestDetailForm.vesselName,
                border: [true, false, true, true],
              },
              {
                text: jsonData.requestDetailForm.voyageNumber,
                border: [true, false, true, true],
              },
            ],
            [
              {
                text: 'Consignee',
                style: 'headerCell',
                border: [true, true, true, false],
              },
              {
                text: 'Port of Loading',
                style: 'headerCell',
                border: [true, true, true, false],
                colSpan: 2,
              },
              '',
            ],
            [
              {
                text: jsonData.partiesDetailForm.consigneeName,
                border: [true, false, true, false],
              },
              {
                text: jsonData.partiesDetailForm.portLoading,
                border: [true, false, true, true],
                colSpan: 2,
              },
              '',
            ],
            [
              {
                text: jsonData.partiesDetailForm.consigneeNpwp,
                border: [true, false, false, false],
              },
              {
                text: 'Port of Discharge',
                style: 'headerCell',
                border: [true, false, true, false],
                colSpan: 2,
              },
              '',
            ],
            [
              { text: '', border: [true, false, true, true] },
              {
                text: jsonData.partiesDetailForm.placeDischarge,
                border: [true, false, true, true],
                colSpan: 2,
              },
              '',
            ],
            [
              {
                text: 'Shipper/Exporter',
                style: 'headerCell',
                border: [true, false, true, false],
              },
              {
                text: 'Port of Delivery',
                style: 'headerCell',
                border: [true, false, true, false],
                colSpan: 2,
              },
              '',
            ],
            [
              {
                text: jsonData.partiesDetailForm.shipperName,
                border: [true, false, true, true],
              },
              {
                text: jsonData.partiesDetailForm.placeDestination,
                border: [true, false, true, true],
                colSpan: 2,
              },
              '',
            ],
          ],
        },
      },
      '\n\n',
      {
        table: {
          widths:
            type === 'container'
              ? [110, 80, 'auto', 80, 110, 70]
              : [150, 125, 120, 120],
          heights: 15,
          headerRows: 1,
          alignment: 'center',
          body: buildTableBody(jsonData, type),
        },
      },
    ],
  };

  return docDefinition;
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

function buildTableBody(data: any, type: string) {
  let body = [];
  if (type === 'container') {
    const containerData = data.containerDetailForm;
    body.push([
      { text: 'Container No', alignment: 'center' },
      { text: 'Seal No', alignment: 'center' },
      { text: 'Size Type', alignment: 'center' },
      { text: 'Gross Weight', alignment: 'center' },
      { text: 'Depo Name', alignment: 'center' },
      { text: 'Phone Number', alignment: 'center' },
    ]);
    containerData.map((row) => {
      let dataRow = [];
      dataRow.push(row['containerNumber']);
      dataRow.push({
        text: row['containerSeal'].join('\n'),
        alignment: 'center',
      });
      dataRow.push({ text: row['sizeType'], alignment: 'center' });
      dataRow.push({
        text: [
          row['grossWeightAmount'].toString(),
          row['grossWeightUnit'],
        ].join(' - '),
        alignment: 'center',
      });
      dataRow.push({ text: row['depoForm'].nama, alignment: 'center' });
      dataRow.push({ text: row['depoForm'].noTelp, alignment: 'center' });
      body.push(dataRow);
    });
    return body;
  } else {
    const nonContainerData = data.nonContainerDetailForm;
    body.push([
      { text: 'Description of Goods', alignment: 'center' },
      { text: 'Package\n(Quantity & Satuan)', alignment: 'center' },
      { text: 'Gross Weight\n(Quantity & Satuan)', alignment: 'center' },
      { text: 'Measurement\n(Quantity & Satuan)', alignment: 'center' },
    ]);
    nonContainerData.map((row) => {
      let dataRow = [];
      dataRow.push(row['goodsDescription']);
      dataRow.push(
        [
          row['packageQuantityAmount'].toString(),
          row['packageQuantityUnit'],
        ].join(' - '),
      );
      dataRow.push(
        [row['grossWeightAmount'].toString(), row['grossWeightUnit']].join(
          ' - ',
        ),
      );
      dataRow.push(
        [row['measurementVolume'].toString(), row['measurementUnit']].join(
          ' - ',
        ),
      );
      body.push(dataRow);
    });
    return body;
  }
}
