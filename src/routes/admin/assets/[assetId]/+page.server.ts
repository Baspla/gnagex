import { getAssetById, getUserAssetTransactions, bulkAddAssetPriceHistory, deleteAssetPriceHistoryInRange } from "$lib/server/db/actions";
import { requireAuth } from "$lib/server/guards";
import { fetchHistoricalData } from "$lib/server/yahoo/finance";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event);
    // @ts-ignore - The slug parameter is correctly typed in SvelteKit, but is not recognized by TypeScript here.
    const assetId: string = event.params.assetId;
    const asset = await getAssetById(assetId);
    const page = Number(event.url.searchParams.get('page')) || 1;
    const pageSize = Number(event.url.searchParams.get('pageSize')) || 10;

    // Validate
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, Math.min(100, pageSize));

    const { transactions, totalCount } = await getUserAssetTransactions(user.id, assetId, safePage, safePageSize);

    return {
        asset,
        transactions,
        totalCount,
        page: safePage,
        pageSize: safePageSize
    };
}

export const actions: Actions = {
    fetchHistory: async ({ request, params }) => {
        const formData = await request.formData();
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;
        
        // @ts-ignore
        const assetId = params.assetId;
        const asset = await getAssetById(assetId);

        if (!asset || !asset.symbol) {
             return { success: false, error: "Asset has no symbol" };
        }

        try {
            const data = await fetchHistoricalData(asset.symbol, startDate, endDate);
            console.log(`Fetched ${data.length} historical records for ${asset.symbol} from ${startDate} to ${endDate}`);

            if (data.length > 0) {
                const dates = data.map(d => new Date(d.date).getTime());
                const minDate = new Date(Math.min(...dates));
                const maxDate = new Date(Math.max(...dates));

                await deleteAssetPriceHistoryInRange(asset.id, minDate, maxDate);
                console.log(`Deleted existing price history for asset ${asset.symbol} between ${minDate.toISOString()} and ${maxDate.toISOString()}`);

                const historyRecords = data.map(item => ({
                    assetId: asset.id,
                    date: new Date(item.date),
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    volume: item.volume
                }));

                await bulkAddAssetPriceHistory(historyRecords);
                console.log(`Inserted ${historyRecords.length} new price history records for asset ${asset.symbol}`);
            }

             return { success: true, count: data.length };
        } catch (e) {
            console.error(e);
             return { success: false, error: "Failed to fetch data" };
        }
    }
};
