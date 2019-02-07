import { format, utcToZonedTime } from 'date-fns-tz';
import config from 'utils/config';

const { timeZone } = config;

/**
 * Format meeting time to a readable time. Support old string values along with time in epoch
 * @param meetingTime
 */
export const formatMeetingTime = (meetingTime: string): string => {
  let formatted = meetingTime;
  try {
    const toNumber = Number(meetingTime);
    if (!Number.isNaN(toNumber)) {
      formatted = format(utcToZonedTime(toNumber, timeZone), 'h:mm b', {
        timeZone,
      });
    }
  } catch (error) {
    formatted = meetingTime;
  }
  return formatted;
};
