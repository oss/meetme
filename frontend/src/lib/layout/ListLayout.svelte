<script lang=ts>
  import * as CalendarAPI from "$lib/api/calendar.js";

  let active = $state(0);
  const tabs = [
    { label: "My Calendars", columns: ["Name", "Role", "Organization", "Actions"], fetch: () => CalendarAPI.getCalendars() },
    { label: "My Organizations", columns: ["Name", "Role", "Member Count", "Actions"], fetch: () => CalendarAPI.getCalendars() },
    { label: "My Invites", columns: ["Name", "Role", "Member Count", "Actions"], fetch: () => CalendarAPI.getCalendars() },
  ];
</script>

<div class="flex max-w-9/10 gap-2 mt-8 m-auto h-[90dvh] w-[60dvw]">
  <div class="tabs tabs-lift">
    {#each tabs as tab}
      <input type="radio" name="tabs" class="tab" aria-label="{tab.label}" checked/>
      <div class="tab-content bg-base-100 border-base-300 p-6">

	<div class="flex gap-4">
	  <label class="input">
	    <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
	      <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor" >
		<circle cx="11" cy="11" r="8"></circle>
		<path d="m21 21-4.3-4.3"></path>
	      </g>
	    </svg>
	    <input type="search" class="grow" placeholder="Search" />
	    <kbd class="kbd kbd-sm">⌘</kbd>
	    <kbd class="kbd kbd-sm">K</kbd>
	  </label>
	  <form class="filter">
	    <input class="btn btn-square" type="reset" value="×"/>
	    <input class="btn" type="radio" name="calendars" aria-label="Mine"/>
	    <input class="btn" type="radio" name="calendars" aria-label="User"/>
	    <input class="btn" type="radio" name="calendars" aria-label="Orgs"/>
	  </form>
	</div>

	<div class="overflow-x-auto mt-6">
	  <table class="table table-zebra">
	    <thead>
	      <tr>
		<th></th>
		{#each tab.columns as column}
		<th>{column}</th>
		{/each}
	      </tr>
	    </thead>
	    <tbody>
	    {#await tabs[active].fetch()}
	    {:then data}
	      {#each data as calendar, i}
		<tr>
		  <th>{i + 1}</th>
		  <td>{calendar.name}</td>
		  <td>{calendar.role}</td>
		  <td>{calendar.organizationId ?? ""}</td>
		  <td>stuff</td>
		</tr>
	      {/each}
	      {:catch error}
		<div class="alert alert-error">{error.message}</div>
	    {/await}
	    </tbody>
	  </table>
	</div>
      </div>
    {/each}
    
  </div>
</div>
