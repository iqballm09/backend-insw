import { test, expect } from '@jest/globals';

const checkRoleUser = (userInfo: any) => {
  return userInfo.profile.details.kd_detail_ga ? 'SL' : 'CO';
};

const userInfo1 = {
  sub: 'admin_demo_co',
  profile: {
    details: {
      full_name: 'USER DEMO CO',
      id: 'a0a45fbe-b39f-1889-8052-48fda13108f5',
      username: 'admin_demo_co',
      position: 'Admin Demo CO',
      photo_profile: null,
      employee_number: null,
      active: true,
      verified: true,
      kd_ga: null,
      ur_ga: null,
      kd_detail_ga: null,
      kd_level_ga: null,
      admin: true,
    },
    address: {
      address: 'Jl. Testing',
      postal_code: null,
      city: null,
    },
    contact: {
      mobile_phone: '6281393059038',
      phone_number: '08191212',
      email: 'belajar.fadel@gmail.com',
    },
    identity_number: '123',
    email: 'belajar.fadel@gmail.com',
  },
  role: {
    id: 33860,
    uuid: 'b0497d1b-57b3-8ec8-43c9-23d8aaa7dd78',
    kd_ga: null,
    name: 'Super Admin - PT. WISC INDONESIA',
    level: 1,
  },
  organization: {
    details: {
      name: 'PT. WISC INDONESIA',
      id: '58192a7b-ddc2-f125-0fe1-db25e0f85cd8',
      active: true,
    },
    address: {
      address:
        'GD UTAKA LT 2 R206, JL UTAN KAYU RAYA NO 66B, UTAN KAYU UTARA, MATRAMAN',
      postal_code: '13120',
      city: 'JAKARTA TIMUR',
      city_code: null,
    },
    nib: '9120213092987',
    npwp: '033147794001000',
    npwp16: null,
    nitku: null,
    pic: {
      identity_number: null,
    },
    contact: {
      phone_number: '85909637',
      fax_number: '85911279',
    },
  },
};

const userInfo2 = {
  sub: 'admin_demo_sl',
  profile: {
    details: {
      full_name: 'USER DEMO SL',
      id: '4d39a281-ce34-1c72-675e-2a730b7b659a',
      username: 'admin_demo_sl',
      position: 'Admin Demo SL',
      photo_profile: null,
      employee_number: '',
      active: true,
      verified: true,
      kd_ga: '00',
      ur_ga: 'Lembaga National Single Window (LNSW)',
      kd_detail_ga: '067',
      kd_level_ga: null,
      admin: true,
    },
    address: {
      address: '',
      postal_code: '',
      city: '',
    },
    contact: {
      mobile_phone: '6281363756690',
      phone_number: '',
      email: 'inkka.dwitama@insw.go.id',
    },
    identity_number: '3515160508750003',
    email: 'inkka.dwitama@insw.go.id',
  },
  role: {
    id: 11768,
    uuid: 'd49f76e9-58ae-bb48-964f-77a694c995d9',
    kd_ga: null,
    name: 'Admin Demo SL',
    level: 1,
  },
  organization: {
    details: {
      name: 'HARINI MANDIRI',
      id: '26fbd4e5-0c22-7346-6296-f6c91cb05abc',
      active: true,
    },
    address: {
      address: 'JL. KOL. SUGIONO NO. 3-C AUR MEDAN MAIMUN ',
      postal_code: '20151',
      city: 'MEDAN',
      city_code: null,
    },
    nib: '8120214262466',
    npwp: '020950184121000',
    npwp16: null,
    nitku: null,
    pic: {
      identity_number: '',
    },
    contact: {
      phone_number: '4515599',
      fax_number: '4154461',
    },
  },
};

describe('Check role of user', () => {
  it('Check if role of user is CO', () => {
    expect(checkRoleUser(userInfo1)).toBe('CO');
  });

  it('Check if role of user is SL', () => {
    expect(checkRoleUser(userInfo2)).toBe('SL');
  });
});
