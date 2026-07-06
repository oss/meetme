import {Calendar} from "@event-calendar/core";

// TODO: figure out a way to have 1. types for forms and 2. also add validation here

export interface CalendarInfo {
  id: number;
  organizationId: number | null;
  name: string;
  role: string;
};

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
    resourceIds: [timeblock.userId],
  };
}

export async function getCalendars(): Promise<CalendarInfo[]> {
  const res = await fetch("/api/calendar/list");
  const json = await res.json();
  return json.calendars;
}

interface Timeblock {
  id: number;
  userId: number;
  calendarId: number;
  start: Date;
  end: Date;
  description: string;
};

export async function getAllTimeblocks(calendars: number[]): Promise<Timeblock[]> {
  let url = "/api/calendar/timeblocks/list";
  let query = "?" + calendars.map(id => `calendars=${id}`).join("&");
  const res = await fetch(calendars.length > 0 ? url + query : url);
  const json = await res.json();
  return json.timeblocks;
}
