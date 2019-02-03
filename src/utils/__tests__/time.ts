import { parseISO } from 'date-fns';
import { format } from 'date-fns-tz';
import config from 'utils/config';
import { formatMeetingTime } from '../time';

const { timeZone } = config;

describe('Election Controller', () => {
  test('Date Formatting', () => {
    const dateString: string = '2019-02-04 23:39:07.983';
    const parsedDate = parseISO(dateString);
    expect(format(parsedDate, 'MM/dd/yyyy', { timeZone })).toBe('02/04/2019');
  });

  test('formatMeetingTime', () => {
    expect(formatMeetingTime('1547595966700')).toBe('4:46 PM');
    expect(formatMeetingTime('7pm')).toBe('7pm');
  });
});
