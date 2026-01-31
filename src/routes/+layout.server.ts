import { isAdmin, requireAuth } from '$lib/server/guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const user = requireAuth(event);
    return {
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
			displayName: user.displayName,
			groups: user.groups,
			avatarUrl: user.avatarUrl,
            isAdmin: isAdmin(user),
		},
    };
};
