export class Lodge {
  _id: string;

  constructor(id: string) {
    this._id = id;
  }
}

export class User {
  userId: string;

  _id: string;

  isAdmin: boolean;

  belongsTo: Array<any>;

  constructor(
    id: string,
    admin: boolean = false,
    belongsTo: Array<Object> = []
  ) {
    this._id = id;
    this.userId = id;
    this.isAdmin = admin;
    if (!admin) {
      this.belongsTo = [
        {
          organization: '0825ba26-6b81-4c02-b216-9d5710c3d6a6',
        },
        ...belongsTo,
      ];
    } else {
      this.belongsTo = [];
    }
  }
}

export class Unit {
  _id: string;
  chapter: string;
  constructor(_id: string, chapter: string) {
    this._id = _id;
    this.chapter = chapter;
  }
}
export class Election {
  _id: string;
  chapter: string;
  constructor(_id: string, chapter: string) {
    this._id = _id;
    this.chapter = chapter;
  }
}

export const regularUser = new User('337f03ba-b77c-4dc9-b7e9-3c061b5e4931');
export const adminUser = new User('591d0e4d-8a91-4f1a-9850-96454aa32a2d', true);
export const chapterUser = new User(
  'b147853e-df09-41a7-a598-00452dd71d09',
  false,
  [{ organization: '667993b3-01c3-409f-81fa-eb6c86ed9406' }]
);
export const lodge1 = new Lodge('0825ba26-6b81-4c02-b216-9d5710c3d6a6');
export const lodge2 = new Lodge('a603c695-9e06-4e09-bb0d-00539d10417d');
export const unit1 = new Unit(
  '56a53fff-3411-4a05-b8da-93937f7fb99e',
  '667993b3-01c3-409f-81fa-eb6c86ed9406'
);
export const unit2 = new Unit(
  '188c52d9-ccf1-47e6-b695-e03ae3661cbb',
  '52fcdb19-a303-4315-ba98-0dd5f8376738'
);
export const election1 = new Election(
  '8a9553c4-ef09-4c59-8154-bc4f4846447f',
  '667993b3-01c3-409f-81fa-eb6c86ed9406'
);
export const election2 = new Election(
  'ab47a7b1-73d8-4d05-94b7-139b6e2a22c8',
  '52fcdb19-a303-4315-ba98-0dd5f8376738'
);
