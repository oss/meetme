import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const res = await fetch(`/api/calendar/${params.id}`);
  const json = await res.json();
  return json.calendar;
};
