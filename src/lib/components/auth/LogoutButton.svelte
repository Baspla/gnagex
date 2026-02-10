<script lang="ts">
	import { authClient } from '$lib/auth-client';
	const { children, callbackURL } = $props();
</script>

<button
	onclick={async () => {
		await authClient.signOut();
		location.reload();
	}}
	class="w-full"
>
	{@render children()}</button
>
