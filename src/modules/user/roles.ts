import { AbilityBuilder } from '@casl/ability';

export const defineAbilitiesFor = user =>
  AbilityBuilder.define((can, cannot) => {
    can('create', 'User');
    can('read', 'Lodge');

    if (user) {
      if (user.isAdmin) {
        can('manage', 'Lodge');
        can('manage', 'User');
        can('manage', 'Unit');
      } else {
        const ids = user.belongsTo.map(related => related._id);
        can('read', 'Lodge', { _id: { $in: ids } });
        can('read', 'Unit', { _id: { $in: ids } });
        can('manage', 'User', { _id: user.userId });
      }
    }
  });

export const ANONYMOUS = defineAbilitiesFor(null);
