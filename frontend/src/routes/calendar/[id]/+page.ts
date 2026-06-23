import * as Calendar from "$lib/api/calendar.js";
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const id = parseInt(params.id);
  const data = await Calendar.data(id);
  const timeblocks = await Calendar.timeblocks(id);
  const events = timeblocks.map(block => ({
    id: block.id,
    resourceIds: [block.userId],
    title: block.description,
    start: block.start,
    end: block.end,
  }));
  return {
    calendar: data,
    events: events
  };
};
