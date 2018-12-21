import { AbilityBuilder } from '@casl/ability';
import { TokenUser } from 'user/model';

export const defineAbilitiesFor = (user?: TokenUser) =>
  AbilityBuilder.define((can, cannot) => {
    can('create', 'User');
    can('read', 'Lodge');

    if (user) {
      if (user.isAdmin) {
        can('manage', 'Lodge');
        can('manage', 'User');
        can('manage', 'Unit');
        can('manage', 'Election');
        can('administer', 'User');
      } else {
        const ids = user.belongsTo.map(related => related.organization);
        can('read', 'Lodge', { _id: { $in: ids } });
        can('read', 'Unit', { _id: { $in: ids } });
        can('create', 'Unit');
        can('read', 'Election', { _id: { $in: ids } });
        can('create', 'Election');
        can('manage', 'User', { _id: user.userId });
      }
    }
  });

export const ANONYMOUS = defineAbilitiesFor();
