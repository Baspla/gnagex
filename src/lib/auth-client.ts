import { createAuthClient } from "better-auth/svelte";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [
		genericOAuthClient()
	],
	baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:5173"
});
