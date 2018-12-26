export class Lodge {
  id: string;

  constructor(id) {
    this.id = id;
  }
}

export class User {
  userId: string;

  id: string;

  isAdmin: boolean;

  belongsTo: Array<any>;

  constructor(id, admin = false) {
    this.id = id;
    this.userId = id;
    this.isAdmin = admin;
    if (!admin) {
      this.belongsTo = [
        {
          organization: 'abc',
        },
      ];
    } else {
      this.belongsTo = [];
    }
  }
}

export const regularUser = new User('123');
export const adminUser = new User('456', true);
export const lodge1 = new Lodge('abc');
export const lodge2 = new Lodge('def');
