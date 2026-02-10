import { createAuthClient } from "better-auth/svelte";
import { genericOAuthClient } from "better-auth/client/plugins";
import { env } from "$env/dynamic/public";

export const authClient = createAuthClient({
	plugins: [
		genericOAuthClient()
	],
	baseURL: env.PUBLIC_BETTER_AUTH_URL || "http://localhost:5173"
});

if (!env.PUBLIC_BETTER_AUTH_URL) {
	console.warn("PUBLIC_BETTER_AUTH_URL is not set in the client, defaulting to http://localhost:5173. Make sure to set this in production!");
}
