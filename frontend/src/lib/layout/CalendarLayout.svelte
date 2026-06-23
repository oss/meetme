<!-- Layout for calendar views, basically shows a sidebar and a calendar
     Also adds a modal for editing events. Accepts children and sidebar props.
  -- -->
<script lang="ts">
    import {Calendar, TimeGrid, DayGrid, Interaction} from '@event-calendar/core';
    import type { Attachment } from 'svelte/attachments';
    import { onMount } from 'svelte';

    let { sidebar, children, calendarId, events } = $props();
    // Used to set the scroll of the calendar, we want to show at least two
    // hours before the current time
    let date = new Date();
    date.setHours(date.getHours() - 2);

    let form;
    let editModal;
    onMount(() => {
      import('cally');
      editModal = document.getElementById("event-edit-modal");
    });

    let ec = $state();
    let selectedEvent = $state(null);
    let options = $state({
        view: 'timeGridWeek',
        headerToolbar: {start: 'prev,next today', center: 'title', end: 'timeGridDay,timeGridWeek,dayGridMonth'},
        height: '650px',
        slotHeight: 25,
        nowIndicator: true,
        scrollTime: date,
        editable: true,
        selectable: true,
        pointer: true,
        select: addEvent,
        eventClick: editEvent,
        theme: function(theme) {
            theme['button'] = 'btn btn-sm join-item';
            theme['buttonGroup'] = 'join';
            theme['active'] = 'btn-primary';
            return theme;
        },
        events: events ?? []
    });

    const modalAttachment: Attachment = (element) => {
      element.showModal();
    };

    async function addEvent(info) {
        if (calendarId) {
          const res = await fetch(`/api/calendar/${calendarId}/timeblocks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              block: {
                start: info.start,
                end: info.end,
                allDay: info.allDay
              }
            }),
          });
          const json = await res.json();
          const timeblock = json.timeblock;

          ec.addEvent({
            id: timeblock.id,
            resourceIds: [timeblock.userId],
            title: timeblock.description,
            start: timeblock.start,
            end: timeblock.end,
          });
        }
    }

    function editEvent(info) {
        selectedEvent = info.event;
    }

    async function saveEvent() {
        const data = new FormData(form);
        ec.updateEvent({
          id: selectedEvent.id,
          start: data.get("startDate"),
          end: data.get("endDate"),
          title: data.get("description"),
        });

        const res = await fetch(`/api/calendar/${calendarId}/timeblocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            block: {
              id: selectedEvent.id,
              start: data.get("startDate"),
              end: data.get("endDate"),
              title: data.get("description"),
            }
          }),
        });

        selectedEvent = null;
    }

    function closeModal() {
        selectedEvent = null;
    }

    export function setDate(value) {
        options.date = value;
    }
</script>

<div class="flex max-w-9/10 gap-2 mt-8 m-auto">
  <div class="basis-1/8">
    {#if sidebar}
    {@render sidebar(ec)}
    {/if}
  </div>

  <div class="divider divider-horizontal"></div>

  <div class="basis-3/4 dashed-lines p-2">
    <Calendar bind:this={ec} plugins={[TimeGrid, DayGrid, Interaction]} {options} />
  </div>
</div>
<div>
  {#if children}
    {@render children()}
  {/if}
</div>

{#if selectedEvent}
  <dialog id="event-edit-modal" class="modal" {@attach modalAttachment} onclose={closeModal}>
  <form bind:this={form} onsubmit={saveEvent}>
    <div class="modal-box max-w-110">
      <h1 class="text-lg font-bold text-wrap">Edit Event</h1>
      <p class="py-4">Press ESC key to abort and discard all changes. Fun tip: use
        <kbd class="kbd kbd-sm">PgUp</kbd>,
        <kbd class="kbd kbd-sm">PgDn</kbd>
        to add or subtract 10 seconds.
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Description</legend>
          <textarea class="textarea h-24 w-full" placeholder="Write something awesome" name="description">{selectedEvent?.title ?? ""}</textarea>
          <div class="label">Optional</div>
        </fieldset>

        <label class="input mt-2 w-full">
          <span class="label">Start date</span>
          <input type="datetime-local" name="startDate" defaultValue={selectedEvent.start.toISOString().slice(0,16) ?? ""}/>
        </label>
        <label class="input mt-2 w-full">
          <span class="label pr-5">End date</span>
          <input type="datetime-local" name="endDate" defaultValue={selectedEvent.end.toISOString().slice(0,16) ?? ""}/>
        </label>
        <div class="flex w-full gap-8">
          <button class="btn btn-error mt-4 grow-1">Delete</button>
          <button type="submit" class="btn btn-success mt-4 grow-3">Save</button>
        </div>
    </div>
  </form>
</dialog>
{/if}

<style>
:global {
    .ec {
        --ec-bg-color: var(--color-base-100);
        --ec-border-color: var(--color-base-300);
    }

    .ec-main {
        border-radius: 4px;
    }

    .ec-day {
      &.ec-today {
        --ec-day-bg-color: var(--color-base-100);
      }
    }

    .ec-time-grid .ec-body .ec-day {
        background-image: 
            linear-gradient(to top, var(--ec-day-bg-color) 1px, transparent 1px), 
            linear-gradient(to top, var(--ec-border-color) 1px, transparent 1px), 
            linear-gradient(to right, var(--ec-day-bg-color) 1px, transparent 1px), 
            linear-gradient(to top, transparent 1px, transparent 1px);
    }

    .ec-time-grid .ec-body .ec-sidebar {
        --ec-direction: unset;
    }

    .ec-col-group, .ec-col-head {
        border-right: none; 
    }

    .ec-col-group, .ec-col-head {
      &.ec-today {
        background-color: var(--color-primary);
      }
    }
}
</style>
