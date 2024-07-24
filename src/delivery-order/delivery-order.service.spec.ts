import { beforeEach, describe, it } from '@jest/globals';
import { DeliveryOrderController } from './delivery-order.controller';
import { DeliveryOrderService } from './delivery-order.service';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { ShippinglineService } from 'src/referensi/shippingline/shippingline.service';
import { DepoService } from 'src/referensi/depo/depo.service';
import { SmartContractService } from 'src/smart-contract/smart-contract.service';
import { FlagService } from 'src/referensi/flag/flag.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('DeliveryOrderController', () => {
  let deliveryOrderController: DeliveryOrderController;
  let deliveryOrderService: DeliveryOrderService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DeliveryOrderController],
      providers: [
        DeliveryOrderService,
        UserService,
        AuthService,
        PrismaService,
        ShippinglineService,
        DepoService,
        SmartContractService,
        FlagService,
        ConfigService,
      ],
    }).compile();
    deliveryOrderController = moduleRef.get<DeliveryOrderController>(
      DeliveryOrderController,
    );
    deliveryOrderService =
      moduleRef.get<DeliveryOrderService>(DeliveryOrderService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  describe('Get header data DO by ID', () => {
    it('Return header data DO with Request Number LNSW20240708YML19878', async () => {
      const result1 = {
        id: 10,
        no_reqdo: 'LNSW20240708YML19878',
        tgl_reqdo: new Date('2024-07-08T06:36:42.921Z'),
        request_type: 1,
        order_id:
          '2b111e6cae45211c0abbb4df894d863654a517fd10cf676fa1e168f7688bd756',
        timezone: 'Asia/Jakarta',
        created_at: new Date('2024-07-08T06:13:13.134Z'),
        created_by: 'admin_demo_co',
      };
      jest
        .spyOn(deliveryOrderService, 'getHeaderData')
        .mockImplementation(async () => result1);

      expect(await deliveryOrderService.getHeaderData(10)).toBe(result1);
    });

    it('Return header data DO with Request Number LNSW20240717YML16981', async () => {
      const result2 = {
        id: 22,
        no_reqdo: 'LNSW20240717YML16981',
        tgl_reqdo: new Date('2024-07-18T06:16:15.137Z'),
        request_type: 2,
        order_id:
          '778f112050df2fb2eedc1ca1d772145acff7162e65366b90fda6a6fd4b8a9ef5',
        timezone: 'Asia/Jakarta',
        created_at: new Date('2024-07-17T11:47:41.246Z'),
        created_by: 'admin_demo_co',
      };
      jest
        .spyOn(deliveryOrderService, 'getHeaderData')
        .mockImplementation(async () => result2);

      expect(await deliveryOrderService.getHeaderData(22)).toBe(result2);
    });

    it('Throws NotFoundException when data is not found', async () => {
      jest
        .spyOn(prismaService.td_reqdo_header_form, 'findUnique')
        .mockResolvedValue(null);

      await expect(deliveryOrderService.getHeaderData(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
