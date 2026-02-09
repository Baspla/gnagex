<script lang="ts">
	import { authClient } from '$lib/auth-client';
	
	let { data } = $props();
</script>

<div>
	<div>
		<div>
			<p>Name: {data.user.name}</p>
			<p>ID: {data.user.id}</p>
			<p>Email: {data.user.email}</p>
			<p>Created At: {data.user.createdAt.toLocaleString()}</p>
			<p>Updated At: {data.user.updatedAt.toLocaleString()}</p>
			<p>Groups: {data.user.groups}</p>
		</div>
	</div>
</div>
