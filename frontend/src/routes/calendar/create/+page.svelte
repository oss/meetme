<script lang="ts">
  import CalendarSettings from '$lib/components/CalendarSettings.svelte';
  import CalendarLayout from '$lib/layout/CalendarView.svelte';
  import { authstore } from "$lib/auth/store.svelte.js";
  
  let calendar;
  function setDate(event) {
    calendar.setDate(event.target.value);
  }
</script>

<CalendarLayout bind:this={calendar}>
  {#snippet sidebar(options)}
  <!-- Owner of the calendar -->
  <div class="flex w-full content-center">
    <h1 class="ml-3 text-lg grow">{authstore.user.netid}</h1>
    <div class="badge badge-neutral">Owner</div>
  </div>

  <CalendarSettings></CalendarSettings>

  <calendar-date onchange={setDate} class="cally bg-base-100 border border-base-300 shadow-lg rounded-box mt-4">
    <svg aria-label="Previous" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
    <svg aria-label="Next" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
    <calendar-month></calendar-month>
  </calendar-date>
  {/snippet}
</CalendarLayout>

