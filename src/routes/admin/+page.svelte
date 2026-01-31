<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>
	<p>Welcome, {page.data.user?.displayName}!</p>
	<p>You have access to this protected admin area.</p>
</div>
