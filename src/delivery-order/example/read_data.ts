import * as fs from 'fs';

export const createContainerData = JSON.parse(
  fs.readFileSync(
    './src/delivery-order/example/create-container.json',
    'utf-8',
  ),
);

export const updateContainerData = JSON.parse(
  fs.readFileSync(
    './src/delivery-order/example/update-container.json',
    'utf-8',
  ),
);

export const createNonContainerData = JSON.parse(
  fs.readFileSync(
    './src/delivery-order/example/create-noncontainer.json',
    'utf-8',
  ),
);

export const updateNonContainerData = JSON.parse(
  fs.readFileSync(
    './src/delivery-order/example/update-noncontainer.json',
    'utf-8',
  ),
);

export const updateDoSLData = JSON.parse(
  fs.readFileSync('./src/delivery-order/example/update-cargo-sl.json', 'utf-8'),
);
