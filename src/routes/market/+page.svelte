<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';

	let { data } = $props();

	function handlePageChange(e: { page: number }) {
		const url = new URL(page.url);
		url.searchParams.set('page', e.page.toString());
		goto(url);
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-2xl font-bold">Market</h1>

	<h2 class="mt-6 mb-2 text-xl font-semibold">Assets</h2>
	<table class="table w-full table-auto">
		<thead>
			<tr>
				<th class="px-4 py-2 text-left">Ticker</th>
				<th class="px-4 py-2 text-left">Name</th>
				<th class="px-4 py-2 text-left">Category</th>
			</tr>
		</thead>
		<tbody>
			{#each data.assets as asset (asset.id)}
				<tr class="hover:bg-surface-500/10">
					<td class="px-4 py-2 font-mono font-bold">
						<a href={`/market/assets/${asset.id}`}>{asset.symbol} </a></td
					>
					<td class="px-4 py-2">{asset.name}</td>
					<td class="px-4 py-2 capitalize">{asset.category.name}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="mt-4 flex justify-center">
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
