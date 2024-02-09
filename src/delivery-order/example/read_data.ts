import * as fs from 'fs';

export const containerData = JSON.parse(
  fs.readFileSync('./src/delivery-order/example/container.json', 'utf-8'),
);

export const nonContainerData = JSON.parse(
  fs.readFileSync('./src/delivery-order/example/noncontainer.json', 'utf-8'),
);
