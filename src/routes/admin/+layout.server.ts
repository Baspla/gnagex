import { requireAdmin } from '$lib/server/guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = requireAdmin(event);
	return {
		user
	};
};
