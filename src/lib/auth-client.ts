import { createAuthClient } from "better-auth/svelte";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [
		genericOAuthClient()
	],
	baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:5173"
});

if (!import.meta.env.BETTER_AUTH_URL) {
	console.warn("BETTER_AUTH_URL is not set in the client, defaulting to http://localhost:5173. Make sure to set this in production!");
}
