<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PredictionMarketCard from '$lib/components/predictions/PredictionMarketCard.svelte';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
	import { Pagination } from '@skeletonlabs/skeleton-svelte';

	let { data } = $props();

	function handlePageChange(e: { page: number }) {
		const url = new URL(page.url);
		url.searchParams.set('page', e.page.toString());
		goto(url);
	}
</script>

<div class="container p-4">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Prediction Markets</h1>
		<a href="/predictions/create" class="text-primary-600 hover:underline">Create Market</a>
	</div>

	<div class="mt-6 space-y-4">
		{#each data.markets as market}
			<PredictionMarketCard {market} />
		{/each}
	</div>

	{#if data.markets.length === 0}
		<div>No prediction markets found. Create one to get started!</div>
	{/if}

	<div class="mt-6 flex justify-center">
		<Pagination
			count={data.totalCount}
			pageSize={data.pageSize}
			page={data.page}
			onPageChange={handlePageChange}
		>
			<Pagination.PrevTrigger>
				<ArrowLeftIcon class="size-4" />
			</Pagination.PrevTrigger>
			<Pagination.Context>
				{#snippet children(pagination)}
					{#each pagination().pages as page, index (page)}
						{#if page.type === 'page'}
							<Pagination.Item {...page}>
								{page.value}
							</Pagination.Item>
						{:else}
							<Pagination.Ellipsis {index}>&#8230;</Pagination.Ellipsis>
						{/if}
					{/each}
				{/snippet}
			</Pagination.Context>
			<Pagination.NextTrigger>
				<ArrowRightIcon class="size-4" />
			</Pagination.NextTrigger>
		</Pagination>
	</div>
</div>
