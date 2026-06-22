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
