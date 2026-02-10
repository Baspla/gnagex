import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {

	const user = (await event.parent()).user;

	return {
		user
	};
};
