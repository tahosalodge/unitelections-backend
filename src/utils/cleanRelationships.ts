import User from 'user/model';
import Unit from 'unit/model';
import Election from 'election/model';
import Lodge from 'lodge/model';

const cleanRelationships = async () => {
  const [users, units, elections, lodges] = await Promise.all([
    User.find(),
    Unit.find(),
    Election.find(),
    Lodge.find(),
  ]);

  const models = {
    User: users,
    Unit: units,
    Election: elections,
    Chapter: lodges[0].chapters,
    Lodge: lodges,
  };

  users.forEach(user => {
    const newRelationships = user.belongsTo.filter(r =>
      models[r.model].find(m => m.id === r.organization)
    );
    console.log(user.belongsTo, newRelationships);
  });
};
