<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Crew Capital - Error {page.status}</title>
</svelte:head>

<div class="flex h-full w-full flex-col items-center justify-center space-y-4">
    <span class="text-6xl">🫠</span>
	<h1 class="text-2xl font-bold">Error {page.status}</h1>
	<p>{page.error?.message}</p>
</div>
