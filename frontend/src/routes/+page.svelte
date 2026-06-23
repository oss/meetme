<script lang=ts>
  import { authstore } from "$lib/services/auth.svelte.js";
</script>
<div class="">
  <div class="flex justify-center m-auto pt-16 pb-12 max-w-8/10 gap-8">
    <div class="prose lg:prose">
      <article>
	<h1>MeetMe, making meetings happen for the Rutgers Community</h1>
	<p> Schedule, share, and create meetings for yourself, your community, and
	  for everyone. With MeetMe you can seamlessly share your schedule with others
	  or create a schedule for your organization.

	  Officially integrated with Rutgers.
	</p>
      </article>
      <div class="flex gap-8">
        {#if authstore.authenticated}
	<a class="btn btn-primary btn-lg" href="/dashboard">Dashboard</a>
        {:else}
	<a class="btn btn-primary btn-lg" href="/api/auth/login">Login with CAS</a>
        {/if}
	<button class="btn btn-soft btn-lg">See a demo</button>
      </div>
    </div>

    <div class="mockup-browser bg-base-100 w-full border border-base-300">
      <div class="mockup-browser-toolbar">
	<div class="input">https://meetme.rutgers.edu</div>
      </div>
      <div class="grid place-content-center h-80">Hello!</div>
    </div>
  </div>
</div>
<div class="flex justify-center m-auto mt-12 mb-12 gap-8">
  <div class="card bg-base-100 w-96 shadow-sm">
    <!-- <figure> -->
    <!--   <img -->
    <!-- 	src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" -->
    <!-- 	alt="Shoes" /> -->
    <!-- </figure> -->
    <div class="card-body">
      <h2 class="card-title">Card Title</h2>
      <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
    </div>
  </div>
  <div class="card bg-base-100 w-96 shadow-sm">
    <!-- <figure> -->
    <!--   <img -->
    <!-- 	src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" -->
    <!-- 	alt="Shoes" /> -->
    <!-- </figure> -->
    <div class="card-body">
      <h2 class="card-title">Card Title</h2>
      <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
    </div>
  </div>
  <div class="card bg-base-100 w-96 shadow-sm">
    <!-- <figure> -->
    <!--   <img -->
    <!-- 	src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" -->
    <!-- 	alt="Shoes" /> -->
    <!-- </figure> -->
    <div class="card-body">
      <h2 class="card-title">Card Title</h2>
      <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
    </div>
  </div>
</div>

