import { isAdmin } from '$lib/server/admin';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { session, user } = event.locals;
	if (!session || !user) {
		return {
			session: null,
			user: null,
		};
	}
	return {
		session,
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			groups: typeof (user as any).groups === 'string' ? JSON.parse((user as any).groups) : [],
			image: user.image,
			isAdmin: isAdmin(user.groups),
		},
	};
};
