import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	const { user } = await event.parent();
	if (!user.isAdmin) {
		throw redirect(303, '/');
	}
	return { user };
};
