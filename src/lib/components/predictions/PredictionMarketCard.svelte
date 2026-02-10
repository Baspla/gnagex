<script lang="ts">
	import { getProbabilityForMarket } from '$lib/predictions/utils';

	interface Props {
		market: {
			id: string;
			title: string;
			endDate: Date;
			yesPool: number;
			noPool: number;
			status: 'pending' | 'resolved' | 'cancelled' | string;
			result: 'yes' | 'no' | 'null' | string | null;
		};
	}

	let { market }: Props = $props();

	let prob = $derived(getProbabilityForMarket(market.yesPool, market.noPool, 'yes'));
</script>

<a
	href="/predictions/{market.id}"
	class=""
>
	<div class="card flex justify-between preset-filled-surface-100-900 p-4">
		<div>
			<h3 class="text-xl font-semibold">{market.title}</h3>
			<p class="text-sm">
				Ends: {new Date(market.endDate).toLocaleDateString()}
			</p>
			{#if market.status !== 'pending'}
				<div class="mt-2">
					<span
						class="badge {market.status === 'resolved'
							? 'preset-filled-success-500'
							: market.status === 'cancelled'
								? 'preset-filled-surface-500'
								: 'preset-filled-error-500'}"
					>
						{market.status.charAt(0).toUpperCase() + market.status.slice(1)}
					</span>
				</div>
			{/if}
		</div>
		<div class="text-right">
			{#if market.status === 'pending'}
				<div class="text-2xl font-bold">{(prob * 100).toFixed(0)}%</div>
				<div class="text-sm">Chance of Yes</div>
			{:else if market.status === 'resolved'}
				{#if market.result === 'yes'}
					<div class="text-2xl font-bold text-success-500">YES</div>
				{:else if market.result === 'no'}
					<div class="text-2xl font-bold text-error-500">NO</div>
				{:else}
					<div class="text-2xl font-bold text-surface-500">--</div>
				{/if}
				<div class="text-sm">Result</div>
			{:else if market.status === 'cancelled'}
				<div class="text-2xl font-bold text-surface-400">Void</div>
			{/if}
		</div>
	</div>
</a>
