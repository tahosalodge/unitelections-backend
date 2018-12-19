import User, { IUser } from 'user/model';
import { IElection } from 'election/model';
import { IUnit } from 'unit/model';
import { emailToUsers } from './sendMail';

export const notifyElectionRequested = async (params: {
  election: IElection;
  unit: IUnit;
  dates: Array<String>;
}) => {
  const { election } = params;
  const users = await User.find().lean();
  const electionChapter = election.chapter.toString();
  const usersForChapter = users.filter(
    (user: IUser) =>
      user.belongsTo.filter(
        b => b.model === 'chapter' && b.organization === electionChapter
      ).length > 0
  );
  emailToUsers(usersForChapter, 'chapter/requestElection', { ...params });
};
