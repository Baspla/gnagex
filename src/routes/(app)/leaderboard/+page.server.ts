import { db } from '$lib/server/db';

export const load = async () => {
	// Fetch all currencies for the header
	const allCurrencies = await db.query.currency.findMany({
		orderBy: (currency, { asc }) => [asc(currency.symbol)]
	});

	// Fetch users with their portfolios and currency balances
	const users = await db.query.user.findMany({
		with: {
			portfolios: {
				with: {
					currencies: {
						with: {
							currency: true
						}
					}
				}
			}
		}
	});

	// Process data to flatten balances
	const leaderboard = users.map((u) => {
		const balances: Record<string, number> = {};
		
		// Initialize all balances to 0
		allCurrencies.forEach((c) => (balances[c.symbol] = 0)); 

		// Sum up balances from all portfolios
		u.portfolios.forEach((p) => {
			p.currencies.forEach((pc) => {
				if (pc.currency && pc.currency.symbol) {
					balances[pc.currency.symbol] = (balances[pc.currency.symbol] || 0) + pc.amount;
				}
			});
		});

		return {
			id: u.id,
			name: u.name,
			image: u.image,
			balances
		};
	});

	return {
		currencies: allCurrencies,
		leaderboard
	};
};
