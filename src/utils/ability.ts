import { AbilityBuilder, AbilityBuilderParts } from '@casl/ability';
import { TokenUser } from 'user/model';

export const LODGE = 'Lodge';
export const USER = 'User';
export const UNIT = 'Unit';
export const ELECTION = 'Election';
export const CANDIDATE = 'Candidate';
export const NOMINATION = 'Nomination';

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
        can('manage', NOMINATION);
        can('administer', USER);
      } else {
        const ids = user.belongsTo.map(related => related.organization);
        const manageableIds = user.belongsTo
          .filter(related => related.canManage)
          .map(related => related.organization);

        can('read', UNIT, { _id: { $in: ids } });
        can('read', UNIT, { chapter: { $in: ids } });
        can('manage', UNIT, { chapter: { $in: manageableIds } });
        can('create', UNIT);

        can('read', ELECTION, { _id: { $in: ids } });
        can('read', ELECTION, { chapter: { $in: ids } });
        can('manage', ELECTION, { chapter: { $in: manageableIds } });
        can('create', ELECTION);

        can('read', CANDIDATE, { election: { $in: ids } });
        can('read', CANDIDATE, { chapter: { $in: ids } });
        can('manage', CANDIDATE, { election: { $in: manageableIds } });
        can('manage', CANDIDATE, { chapter: { $in: manageableIds } });
        can('create', CANDIDATE);

        can('read', NOMINATION, { election: { $in: ids } });
        can('read', NOMINATION, { chapter: { $in: ids } });
        can('manage', NOMINATION, { election: { $in: manageableIds } });
        can('manage', NOMINATION, { chapter: { $in: manageableIds } });
        can('create', NOMINATION);

        can('manage', USER, { _id: user.userId });
      }
    }
  });

export const ANONYMOUS = defineAbilitiesFor();
