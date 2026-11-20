import * as Notifications from 'expo-notifications';

// Local notifications: shown by this phone, no phone number or server needed.
// A backend-triggered push later needs a push token registered from the app.

// Show the banner even while the app is open, so a notification is visible
// when it is sent from this screen.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotifyResult =
  { ok: true; id: string } | { ok: false; reason: string };

// Asks for permission the first time. Returns true when notifications are allowed.
export async function requestNotificationAccess(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Shows a notification right away.
export async function sendNotificationNow(
  title: string,
  body: string,
): Promise<NotifyResult> {
  if (!(await requestNotificationAccess())) {
    return { ok: false, reason: 'Notifications are not allowed for this app.' };
  }
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
    return { ok: true, id };
  } catch (error) {
    return { ok: false, reason: errorText(error) };
  }
}

// Shows a notification at a later time. The date must be in the future.
export async function scheduleNotification(
  title: string,
  body: string,
  when: Date,
): Promise<NotifyResult> {
  if (when.getTime() <= Date.now()) {
    return { ok: false, reason: 'The time must be in the future.' };
  }
  if (!(await requestNotificationAccess())) {
    return { ok: false, reason: 'Notifications are not allowed for this app.' };
  }
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
      },
    });
    return { ok: true, id };
  } catch (error) {
    return { ok: false, reason: errorText(error) };
  }
}

// Reads "HH:mm" (24-hour, local time). Returns null when the text is not a real time.
export function parseTimeOfDay(
  text: string,
): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

// The next moment the clock shows this time: today if it is still ahead,
// otherwise tomorrow.
export function nextOccurrence(
  hour: number,
  minute: number,
  now: Date = new Date(),
): Date {
  const when = new Date(now);
  when.setHours(hour, minute, 0, 0);
  if (when.getTime() <= now.getTime()) {
    when.setDate(when.getDate() + 1);
  }
  return when;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'The notification failed.';
}
