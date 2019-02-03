import { AbilityBuilder, AbilityBuilderParts } from '@casl/ability';
import { TokenUser } from 'user/model';

const LODGE = 'Lodge';
const USER = 'User';
const UNIT = 'Unit';
const ELECTION = 'Election';
const CANDIDATE = 'Candidate';

export const defineAbilitiesFor = (user?: TokenUser) =>
  AbilityBuilder.define((can: AbilityBuilderParts['can']) => {
    can('create', USER);
    can('read', LODGE);

    if (user) {
      if (user.isAdmin) {
        can('manage', LODGE);
        can('manage', USER);
        can('manage', UNIT);
        can('manage', ELECTION);
        can('manage', CANDIDATE);
        can('administer', USER);
      } else {
        const ids = user.belongsTo.map(related => related.organization);
        const manageableIds = user.belongsTo
          .filter(related => related.canManage)
          .map(related => related.organization);
        can('read', LODGE, { _id: { $in: ids } });
        can('read', UNIT, { _id: { $in: ids } });
        can('read', UNIT, { chapter: { $in: ids } });
        can('manage', UNIT, { chapter: { $in: manageableIds } });
        can('create', UNIT);
        can('read', ELECTION, { _id: { $in: ids } });
        can('read', ELECTION, { chapter: { $in: ids } });
        can('manage', ELECTION, { chapter: { $in: manageableIds } });
        can('create', ELECTION);
        can('manage', USER, { _id: user.userId });
      }
    }
  });

export const ANONYMOUS = defineAbilitiesFor();
