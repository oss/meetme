<script lang="ts">
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import { authstore } from "$lib/auth/store.svelte.js";
	import { authenticate } from "$lib/auth/session.js";
	import favicon from '$lib/assets/favicon.svg';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import './layout.css';

	import type { PageProps } from './$types';

	let { children }: PageProps = $props();

	onMount(async () => {
	  await authenticate(page.url.pathname !== "/");
	})
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if authstore.isLoading}
  <div>
    <span class="loading loading-dots loading-xl"></span>
  </div>
{:else if authstore.authenticated || page.url.pathname === "/"}
  <!-- Navbar -->
  <div class="navbar bg-base-100 shadow-sm">
    <!-- Logo  -->
    <div class="flex-1">
      <a class="btn btn-ghost text-xl" href="/dashboard">Rutgers Meetme</a>
    </div>

    <!-- Theme switcher -->
    <ThemeSwitcher></ThemeSwitcher>

    <!-- Login button or profile button -->

    {#if authstore.authenticated}
      <button class="btn btn-primary btn mr-2 ml-4">{authstore.get.netid}</button>
    {:else}
      <a class="btn btn-primary btn mr-2 ml-4" href="/api/auth/login">Login</a>
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
  <div> Redirecting to homepage, please login first </div>
{/if}
