<script lang=ts>
    import CalendarLayout from '$lib/layout/CalendarLayout.svelte';

    let calendar: CalendarLayout;
    let searchModal: HTMLDialogElement;

    function setDate(event: any) {
      calendar.setDate(event.target.value);
    }
</script>

<CalendarLayout bind:this={calendar}>
  {#snippet sidebar()}
  <div class="flex gap-2 w-full">
    <button class="btn flex grow" onclick={() => searchModal.showModal()}>
      <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor"> <circle cx="11" cy="11" r="8"></circle> <path d="m21 21-4.3-4.3"></path> </g> </svg>
      <div class="grow text-start">Add Calendar</div>
      <kbd class="kbd kbd-sm">⌘ K</kbd>
    </button>
    <a class="btn btn-primary flex" href="/calendar/create">
      New
    </a>
  </div>

    <fieldset class="fieldset bg-base-100 border-base-300 h-34 rounded-box border p-4">
      <legend class="fieldset-legend">My Calendars</legend>
      <label class="label">
        <input type="checkbox" class="checkbox checkbox-sm" />
        Remember me
      </label>
    </fieldset>

    <fieldset class="fieldset bg-base-100 border-base-300 h-34 rounded-box border p-4">
      <legend class="fieldset-legend">Organization Calendars</legend>
      <label class="label">
        <input type="checkbox" class="checkbox checkbox-sm" />
        Remember me
      </label>
    </fieldset>
    <calendar-date onchange={setDate} class="cally bg-base-100 border border-base-300 shadow-lg rounded-box mt-4">
      <svg aria-label="Previous" slot="previous" class="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
      <svg aria-label="Next" slot="next" class="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
      <calendar-month></calendar-month>
    </calendar-date>
  {/snippet}
</CalendarLayout>

<dialog id="search-modal" class="modal" bind:this={searchModal}>
  <div class="modal-box">
    <label class="input input-ghost input-lg focus-within:outline-none border-0 border-b-2 border-base-300 w-full rounded-none">
      <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor"> <circle cx="11" cy="11" r="8"></circle> <path d="m21 21-4.3-4.3"></path> </g> </svg>
      <input type="search" class="grow" placeholder="Search calendar..." />
    </label>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
