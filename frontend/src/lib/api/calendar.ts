import {Calendar} from "@event-calendar/core";

export async function data(calendarId: number) {
  const res = await fetch(`/api/calendar/${calendarId}`);
  const json = await res.json();
  return json.calendar;
}

export async function timeblocks(calendarId: number) {
  const res = await fetch(`/api/calendar/${calendarId}/timeblocks`);
  const json = await res.json(); 
  return json.timeblocks;
}

export async function addTimeblock(calendarId: number, event: Calendar.Event): Promise<Calendar.Event> {
  const res = await fetch(`/api/calendar/${calendarId}/timeblocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      block: {
        start: event.start,
        end: event.end,
        description: event.title
      }
    }),
  });
  const json = await res.json();
  const timeblock = json.timeblock;
  return {
    ...event,
    id: timeblock.id,
    resourceIds: [timeblock.userId],
  };
}
