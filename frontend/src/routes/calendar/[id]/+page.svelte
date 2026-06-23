<script lang=ts>
  import CalendarSettings from "$lib/components/CalendarSettings.svelte";
  import CalendarLayout from "$lib/layout/CalendarLayout.svelte";
  import type { PageProps } from './$types';
  import { page } from '$app/state';

  let calendar: CalendarLayout;
  let { data }: PageProps = $props();

  function setDate(event: any) {
    calendar.setDate(event.target.value);
  }
</script>

<CalendarLayout bind:this={calendar} calendarId={parseInt(page.params.id ?? "")} events={data.events}>
  {#snippet sidebar()}
  <div class="flex w-full content-center">
    <h1 class="ml-3 text-lg grow">Studious Student</h1>
    <div class="badge badge-neutral">Owner</div>
  </div>

  <CalendarSettings calendar={data.calendar}></CalendarSettings>

  <div class="tabs tabs-lift mt-4">
    <input type="radio" name="tabs" class="tab" aria-label="Calendar" checked/>
    <div class="tab-content bg-base-100 border-base-300 p-2">
      <calendar-date onchange={setDate} class="cally bg-base-100 border border-base-300 shadow-lg rounded-box">
        <svg aria-label="Previous" slot="previous" class="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
        <svg aria-label="Next" slot="next" class="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
        <calendar-month></calendar-month>
      </calendar-date>
    </div>
  
    <input type="radio" name="tabs" class="tab" aria-label="Users"/>
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>
  
    <input type="radio" name="tabs" class="tab" aria-label="Viewers" />
    <div class="tab-content bg-base-100 border-base-300 p-6">Tab content 3</div>
  </div>
  {/snippet}
</CalendarLayout>
