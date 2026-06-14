<script lang=ts>
  import CalendarView from '$lib/CalendarView.svelte';
  let calendar;
  function setDate(event) {
    calendar.setDate(event.target.value);
  }
</script>

<CalendarView bind:this={calendar}>
  {#snippet sidebar(options)}
  <div class="flex w-full content-center">
    <h1 class="ml-3 text-lg grow">Studious Student</h1>
    <div class="badge badge-neutral">Owner</div>
  </div>
  <fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
    <legend class="fieldset-legend">Calendar Settings</legend>
    <label class="input-xs input-ghost input validator">
      <input
	type="text"
	required
	placeholder="Calendar Name"
	pattern="[A-Za-z][A-Za-z0-9\-]*"
	minlength="3"
	maxlength="30"
	title="Only letters, numbers or dash",
	class="text-lg"
      />
    </label>
    <textarea class="textarea textarea-xs textarea-ghost min-h-12 tetx-base" placeholder="Description"></textarea>
    <label class="input input-xs input-ghost input-sm validator">
      <svg class="opacity-50" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000000" viewBox="0 0 256 256"><path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path></svg>
      <input
	type="text"
	required
	placeholder="Location"
	pattern="[A-Za-z][A-Za-z0-9\-]*"
	minlength="3"
	maxlength="30"
	title="Only letters, numbers or dash"
      />
    </label>
    <label class="input input-xs input-ghost input-sm validator">
      <svg class="opacity-50" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000000" viewBox="0 0 256 256"><path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z"></path></svg>
      <input
	type="text"
	required
	placeholder="Timezone"
	pattern="[A-Za-z][A-Za-z0-9\-]*"
	minlength="3"
	maxlength="30"
	title="Only letters, numbers or dash"
      />
    </label>
    <div class="flex">
      <label class="label ml-3">
	<input type="checkbox" class="checkbox checkbox-xs" />
	Public
      </label>
      <label class="label ml-3">
	<input type="checkbox" class="checkbox checkbox-xs" />
	Sharelink
      </label>
      <label class="label ml-3">
	<input type="checkbox" class="checkbox checkbox-xs" />
	Schedule
      </label>
    </div>
    <div class="flex gap-4">
      <button class="btn btn-sm btn-neutral mt-2">Share</button>
      <button class="btn btn-sm btn-primary mt-2 grow-2">Save Settings</button>
    </div>
  </fieldset>

  <calendar-date on:change={setDate} class="cally bg-base-100 border border-base-300 shadow-lg rounded-box mt-4">
    <svg aria-label="Previous" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
    <svg aria-label="Next" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
    <calendar-month></calendar-month>
  </calendar-date>
  {/snippet}
</CalendarView>

