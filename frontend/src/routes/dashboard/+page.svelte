<script lang=ts>
    import CalendarLayout from '$lib/layout/CalendarLayout.svelte';
    import {Calendar} from "@event-calendar/core";
    import * as CalendarAPI from '$lib/api/calendar.js';

    interface SavedCalendar {
      id: number;
      organizationId: number | null;
      name: string;
      checked: boolean;
    };

    let calendar: CalendarLayout;
    let searchModal: HTMLDialogElement;
    let calendars: CalendarAPI.CalendarInfo[] | null = null;

    let searchTerm = $state("");
    let searchLoading = $state(false);
    let filtered: CalendarAPI.CalendarInfo[] | null = $state(null);
    let savedCalendars: SavedCalendar[] = $state(JSON.parse(window.localStorage.getItem("calendars") ?? "[]"));
   
    // TODO: find a way to remove this deduplication, concatonation seems to break tailwindcss
    const colors = ["!bg-primary", "!bg-secondary", "!bg-accent", "!bg-success", "!bg-info"];
    const checks = [
      "checkbox-primary",
      "checkbox-secondary",
      "checkbox-accent",
      "checkbox-success",
      "checkbox-info"
    ];
    let timeblocks;
    $effect(() => {
       const ids = savedCalendars.filter(cal => cal.checked).map(cal => cal.id);
       CalendarAPI.getAllTimeblocks(ids).then((blocks) => {
         const events = blocks.map(block => ({
           ...block,
           resourceId: block.userId,
           classNames: colors[block.calendarId % colors.length]
         }));
         timeblocks = Object.groupBy(blocks, (block) => block.calendarId);
         calendar.addEvents(events as unknown[] as Calendar.Event[]);
       });
    })

    // Timeblocks of saved calendars are loaded on startup after the user
    // selects them.
    function addCalendar(id: number, name: string, organizationId: number | null) {
      if (savedCalendars.some(c => c.id === id)) {
        return;
      }
      savedCalendars.push({ id: id, name: name, organizationId: organizationId, checked: true });
      window.localStorage.setItem("calendars", JSON.stringify(savedCalendars));
    }

    function saveCalendars() {
      window.localStorage.setItem("calendars", JSON.stringify(savedCalendars));
    }

    async function searchCalendars() {
      if (calendars == null) {
        searchLoading = true;
        calendars = await CalendarAPI.getCalendars();
        searchLoading = false;
      }
      if (searchTerm === "") {
        filtered = calendars;
      } else {
        filtered = calendars.filter(c => c.name.includes(searchTerm.toLowerCase()));
      }
    }

    function setDate(event: any) {
      calendar.setDate(event.target.value);
    }
</script>

<CalendarLayout bind:this={calendar}>
  {#snippet sidebar()}
    <!-- Buttons for adding a calendar or creating a new one -->
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

    <!-- Saved personal calendars -->
    <fieldset class="fieldset bg-base-100 border-base-300 h-34 rounded-box border p-4 overflow-y-auto">
      <legend class="fieldset-legend">My Calendars</legend>
      {#each savedCalendars as calendar, i}
        <div class="flex items-center gap-2">
          <label class="label">
            <input type="checkbox" class="checkbox checkbox-sm {checks[calendar.id % colors.length]}" bind:checked={savedCalendars[i].checked} onchange={saveCalendars}/>
            {calendar.name}
          </label>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" class="opacity-50" fill="#000000" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" class="opacity-50" fill="#000000" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
        </div>
      {/each}
    </fieldset>

    <!-- Saved organization calendars -->
    <fieldset class="fieldset bg-base-100 border-base-300 h-34 rounded-box border p-4">
      <legend class="fieldset-legend">Organization Calendars</legend>
      <label class="label">
        <input type="checkbox" class="checkbox checkbox-sm" />
        Remember me
      </label>
    </fieldset>

    <!-- Date selection widget -->
    <calendar-date onchange={setDate} class="cally bg-base-100 border border-base-300 shadow-lg rounded-box mt-4">
      <svg aria-label="Previous" slot="previous" class="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
      <svg aria-label="Next" slot="next" class="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
      <calendar-month></calendar-month>
    </calendar-date>
  {/snippet}
</CalendarLayout>

<!-- Search calendar modal -->
<dialog id="search-modal" class="modal" bind:this={searchModal}>
  <div class="modal-box h-[80dvh] w-[60dvw]">
    <!-- Search bar -->
    <label class="input input-ghost input-lg focus-within:outline-none border-0 border-b-2 border-base-300 w-full rounded-none">
      <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor"> <circle cx="11" cy="11" r="8"></circle> <path d="m21 21-4.3-4.3"></path> </g> </svg>
      <input type="search" class="grow" placeholder="Search calendar..." bind:value={searchTerm} oninput={searchCalendars}/>
    </label>

    <!-- Filtered calendar results -->
    <div>
      {#if searchLoading}
        <span class="loading loading-spinner loading-xl"></span>
      {:else}
        <div class="flex flex-col mt-6 gap-6">
          {#each filtered as calendar}
            <button class="flex items-center w-full m-auto hover:bg-base-300 p-2 rounded-sm"
              onclick={() => addCalendar(calendar.id, calendar.name, calendar.organizationId)}
            >
              <!-- Shows if a calendar is personal or an organization one -->
              {#if calendar.organizationId !== null}
                <div class="badge badge-sm badge-secondary">Org</div>
                {:else}
                <div class="badge badge-sm badge-primary">User</div>
              {/if}

              <div class="ml-4 text-lg">{calendar.name}</div>
              <div class="ml-18 text-xs opacity-50">{calendar.role}</div>
              <!-- Edit/View calendar button -->
              <a class="btn btn-ghost btn-xs ms-auto" href="/calendar/{calendar.id}" aria-label="Edit or View Calendar {calendar.name}">
                <svg xmlns="http://www.w3.org/2000/svg" class="opacity-50" width="16" height="16" fill="#000000" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg>
              </a>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </div>
</dialog>
