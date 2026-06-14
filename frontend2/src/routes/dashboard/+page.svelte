<script lang=ts>
    import { onMount } from 'svelte';
    import CalendarView from '$lib/CalendarView.svelte';
    let calendar;
    let searchModal

    onMount(() => {
      searchModal = document.getElementById("search-modal");
    });

    function setDate(event) {
      calendar.setDate(event.target.value);
    }

    function openSearch() {
        searchModal.showModal();
    }
</script>

<CalendarView bind:this={calendar}>
  {#snippet sidebar(options)}
  <div class="flex gap-2 w-full">
    <button class="btn flex grow" on:click={openSearch}>
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
        <input type="checkbox" checked="checked" class="checkbox checkbox-sm" />
        Remember me
      </label>
    </fieldset>

    <fieldset class="fieldset bg-base-100 border-base-300 h-34 rounded-box border p-4">
      <legend class="fieldset-legend">Organization Calendars</legend>
      <label class="label">
        <input type="checkbox" checked="checked" class="checkbox checkbox-sm" />
        Remember me
      </label>
    </fieldset>
    <calendar-date on:change={setDate} class="cally bg-base-100 border border-base-300 shadow-lg rounded-box mt-4">
      <svg aria-label="Previous" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
      <svg aria-label="Next" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
      <calendar-month></calendar-month>
    </calendar-date>
  {/snippet}
</CalendarView>

<dialog id="search-modal" class="modal">
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
