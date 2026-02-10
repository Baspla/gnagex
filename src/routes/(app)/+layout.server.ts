import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { portfolio } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ parent, url, cookies }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(303, `/login?redirectTo=${url.pathname}`);
	}

	const portfolios = await db.query.portfolio.findMany({
		where: eq(portfolio.userId, user.id),
		columns: {
			id: true,
			name: true
		}
	});

	let selectedPortfolioId = cookies.get('selected_portfolio_id');

	let selectedPortfolio = portfolios.find((p) => p.id === selectedPortfolioId);

	if (!selectedPortfolio && portfolios.length > 0) {
		selectedPortfolio = portfolios[0];
	}

	return { user, portfolios, selectedPortfolio };
};
