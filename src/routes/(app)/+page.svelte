<script lang="ts">
	import WorkInProgress from '$lib/components/WorkInProgress.svelte';
	import { toaster } from '$lib/toaster.js';

	let { data } = $props();
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-3xl font-bold">Crew Capital</h1>
	<div>
		<p>Hallo, {data.user.name}</p>
	</div>
	<WorkInProgress />
</div>
