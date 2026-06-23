<script lang="ts">
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import { authstore } from "$lib/auth/store.svelte.js";
  import { authenticate } from "$lib/auth/session.js";
  import favicon from '$lib/assets/favicon.svg';

  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import './layout.css';

  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();

  onMount(async () => {
    await authenticate(page.url.pathname !== "/");
  })
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if authstore.isLoading}
  <div class="bg-base-100 w-full h-full">
    <span class="loading loading-dots loading-xl"></span>
  </div>
{:else if authstore.authenticated || page.url.pathname === "/"}
  <!-- Navbar -->
  <div class="navbar bg-base-100 shadow-sm">
    <!-- Logo  -->
    <div class="flex-1">
      <a class="btn btn-ghost text-xl" href={authstore.authenticated ? "/dashboard" : "/"}>Rutgers Meetme</a>
    </div>

    <!-- Theme switcher -->
    <ThemeSwitcher></ThemeSwitcher>

    <!-- Login button or profile button -->
    {#if authstore.authenticated}
      <div class="dropdown dropdown-bottom dropdown-end dropdown-hover">
      <div class="btn bgn-ghost mr-2 ml-4">{authstore.get!.netid}</div>
      <ul tabindex="-1" class="dropdown-content menu bg-base-300 rounded-box z-4 w-52 p-2 mt-1 shadow-sm">
	<li><a href="/dashboard">Dashboard</a></li>
	<li><a href="/organizations/">Organizations</a></li>
	<li><a href="/calendars">Calendars</a></li>
	<li><a href="/profile">Profile</a></li>
	<li><a href="/invites">Invites</a></li>
	<li><a href="/api/auth/logout">Logout</a></li>
      </ul>
      </div>     

    {:else}
      <a class="btn btn-primary mr-2 ml-4" href="/api/auth/login">Login</a>
    {/if}
  </div>
  
  {@render children()}

  <!-- Footer -->
  <footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4 mt-8">
    <aside class="prose-sm max-w-6/10">
      <p>
	Rutgers is an equal access/equal opportunity institution. Individuals with
	disabilities are encouraged to direct suggestions, comments, or complaints
	concerning any accessibility issues with Rutgers websites to
	accessibility@rutgers.edu or complete the Report Accessibility Barrier or
	Provide Feedback Form.
      </p>
    </aside>
  </footer>
{:else}
  <div class="bg-base-100 w-full h-full"> Redirecting to homepage, please login first </div>
{/if}
