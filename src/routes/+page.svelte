<script lang="ts">
	import { authClient } from '$lib/auth-client';
	
	let { data } = $props();
</script>

<div>
	{#if data.user}
		<div>
			<div>
				<p>{data.user.name}</p>
				<p>{data.user.email}</p>
				<p>{data.user.createdAt}</p>
				<p>{data.user.updatedAt}</p>
				<p>{data.user.id}</p>
				<p>{data.user.groups}</p>
			</div>
			<button
				onclick={async () => {
					await authClient.signOut();
					location.reload();
				}}
			>
				Sign Out
			</button>
		</div>
	{:else}
		<button
			onclick={async () => {
				await authClient.signIn.social({
					provider: 'gnagplus'
				});
			}}
		>
			Login with GnagPlus
		</button>
	{/if}
</div>
