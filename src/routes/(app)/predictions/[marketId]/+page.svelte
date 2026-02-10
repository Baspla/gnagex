<script lang="ts">
	import PredictionHistoryChart from '$lib/components/charts/PredictionHistoryChart.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let market = $derived(data.market);
	let history = $derived(data.history);
	let userShares = $derived(data.userShares);
	let user = $derived(data.user);

	// Pagination for user shares
	let page = $state(1);
	const pageSize = 5;
	let paginatedShares = $derived(userShares.slice((page - 1) * pageSize, page * pageSize));
	let totalPages = $derived(Math.ceil(userShares.length / pageSize));

	let sellingShareId = $state<string | null>(null);
</script>

<div>
	<div>
		<!-- Left Column: Info & Chart -->
		<div>
			<div>
				<h1>{market.title}</h1>
				<div class="mb-4 mt-2 flex items-center gap-2">
					{#if market.status !== 'pending'}
						<span
							class="badge {market.status === 'resolved'
								? 'preset-filled-success-500'
								: market.status === 'cancelled'
									? 'preset-filled-surface-500'
									: 'preset-filled-error-500'}"
						>
							{market.status.charAt(0).toUpperCase() + market.status.slice(1)}
						</span>
						{#if market.status === 'resolved' && market.result}
							<span
								class="badge {market.result === 'yes'
									? 'preset-filled-success-500'
									: market.result === 'no'
										? 'preset-filled-error-500'
										: 'preset-filled-surface-500'}"
							>
								Result: {market.result.toUpperCase()}
							</span>
						{/if}
					{:else}
						<span class="badge preset-filled-primary-500">Active</span>
					{/if}
				</div>
				<div>
					<span>Ends: {new Date(market.endDate).toLocaleDateString()}</span>
					{#if market.currency}
						<span>Currency: {market.currency.symbol}</span>
					{/if}
				</div>
			</div>

			<div>
				<PredictionHistoryChart {history} height="400px" />
			</div>

			<div>
				<h2>Description</h2>
				<p>{market.text}</p>
			</div>

            <div>
                 <h2>Your Positions</h2>
                 {#if userShares.length === 0}
                    <p>No positions.</p>
                 {:else}
                    <table>
                        <thead>
                            <tr>
                                <th>Choice</th>
                                <th>Shares</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each paginatedShares as share}
                                <tr>
                                    <td>{share.choice.toUpperCase()}</td>
                                    <td>{share.amount.toFixed(4)}</td>
                                    <td>{new Date(share.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <form method="POST" action="?/sell" use:enhance={() => {
                                            sellingShareId = share.id;
                                            return async ({ update }) => {
                                                sellingShareId = null;
                                                update();
                                            };
                                        }}>
                                            <input type="hidden" name="marketId" value={market.id} />
                                            <input type="hidden" name="shareId" value={share.id} />
                                            <button disabled={sellingShareId === share.id || market.status !== 'pending'}>
                                                {sellingShareId === share.id ? 'Selling...' : 'Sell'}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                    
                    {#if totalPages > 1}
                        <div>
                             <button disabled={page === 1} onclick={() => page--}>Prev</button>
                             <span>Page {page} of {totalPages}</span>
                             <button disabled={page === totalPages} onclick={() => page++}>Next</button>
                        </div>
                    {/if}
                 {/if}
            </div>

			<!-- Resolver Actions Link -->
			{#if market.deciderId === data.user?.id && market.status === 'pending'}
				<div>
					<a href="/predictions/{market.id}/resolve">Resolve Market</a>
				</div>
			{/if}
		</div>

		<!-- Right Column: Trading -->
		<div>
			<div>
			</div>
		</div>
	</div>
</div>

