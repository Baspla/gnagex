<script lang="ts">
	import { authClient } from '$lib/auth-client';
    const {callbackURL} = $props();
</script>

<button class="btn preset-filled-primary-500"
	onclick={async () => {
		await authClient.signIn.oauth2({
			providerId: 'gnagplus',
            callbackURL: callbackURL,
		});
	}}
>
	Login with GnagPlus
</button>
