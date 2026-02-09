<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { toaster } from '$lib/toaster';
	const { callbackURL } = $props();
</script>

<button
	class="btn preset-filled-primary-500"
	onclick={async () => {
		toaster.promise(
			(async () => {
				const { data, error } = await authClient.signIn.oauth2({
					providerId: 'gnagplus',
					callbackURL: callbackURL
				});
				if (error) throw error.message;
				return data;
			})(),
			{
				loading: {
					title: 'Logging in',
					description: 'Please wait...'
				},
				success: (res) => ({
					title: 'Redirecting',
					description: 'You are being redirected...'
				}),
				error: (res) => ({
					title: 'Login failed',
					description: `Error: ${res}`
				})
			}
		);
	}}
>
	Login with GnagPlus
</button>
