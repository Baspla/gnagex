import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { createManualPredictionMarket } from '$lib/server/predictions/predictions';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const currencies = await db.select().from(schema.currency).where(eq(schema.currency.isRealWorld, false));
	return {
		currencies
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const text = formData.get('description') as string; // 'text' in input, renamed to desc in UI maybe? schema uses 'text'
		const endDateStr = formData.get('endDate') as string;
		const poolSizeStr = formData.get('poolSize') as string;
		const currencyId = formData.get('currencyId') as string;

		if (!title || !text || !endDateStr || !poolSizeStr || !currencyId) {
			return fail(400, { missing: true });
		}

		const endDate = new Date(endDateStr);
		const poolSize = parseFloat(poolSizeStr);

		if (isNaN(poolSize) || poolSize <= 0) {
			return fail(400, { invalidPool: true });
		}

		// Ensure currency is allowed (is_real_world = false)
		const currency = await db.query.currency.findFirst({
			where: eq(schema.currency.id, currencyId)
		});

		if (!currency || currency.isRealWorld) {
			return fail(400, { invalidCurrency: true });
		}

		try {
			const marketId = await createManualPredictionMarket(
				title,
				text,
				endDate,
				locals.user.id,
				poolSize,
				currencyId
			);
			throw redirect(303, `/predictions/${marketId}`);
		} catch (e) {
			console.error(e);
            if ((e as any).status === 303) throw e;
			return fail(500, { error: 'Failed to create market' });
		}
	}
};
