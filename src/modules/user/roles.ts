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
        can('read', 'Lodge', { id: { $in: ids } });
        can('read', 'Unit', { id: { $in: ids } });
        can('create', 'Unit');
        can('read', 'Election', { id: { $in: ids } });
        can('create', 'Election');
        can('manage', 'User', { id: user.userId });
      }
    }
  });

export const ANONYMOUS = defineAbilitiesFor();
