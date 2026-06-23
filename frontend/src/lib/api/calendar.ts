import {Calendar} from "@event-calendar/core";

// TODO: figure out a way to have 1. types for forms and 2. also add validation here

export async function create(json: any) {
    const res = await fetch("/api/calendar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
    });
    const payload = await res.json();
    return payload.calendar;
}

export async function patch(calendarId: number, json: any) {
    const res = await fetch(`/api/calendar/${calendarId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: json,
    });
    const payload = await res.json();
    return payload.calendar;
}

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

  
