<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	let market = $derived(data.market);
	let submitting = $state(false);
</script>

<div class="space-y-8 p-4 max-w-4xl mx-auto">
	<header class="space-y-4">
		<h1 class="h1">Resolve Market</h1>
		<p class="text-xl opacity-75">{market.title}</p>
	</header>

	<div class="card p-4 preset-tonal-warning space-y-2">
		<h3 class="h3">Warning: Irreversible Action</h3>
		<p>
			This action is <strong>irreversible</strong>. Once resolved, all payouts will be processed
			immediately. Please verify the outcome carefully against the market description.
		</p>
	</div>

	<div class="card p-4 preset-filled-surface-100-900 border border-surface-200-800 space-y-4">
		<h3 class="h3">Description</h3>
		<p>{market.text}</p>
	</div>

	<form
		method="POST"
		class="grid grid-cols-1 md:grid-cols-3 gap-4"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				update();
			};
		}}
	>
		<button
			type="submit"
			name="result"
			value="yes"
			class="btn h-auto flex-col p-6 preset-filled-success-500 hover:preset-tonal-success transition-all"
			disabled={submitting}
			onclick={(e) => {
				if (!confirm('Are you sure the outcome is YES?')) e.preventDefault();
			}}
		>
			<span class="text-lg font-bold">Resolve YES</span>
			<span class="text-sm opacity-80">Pay out YES holders</span>
		</button>

		<button
			type="submit"
			name="result"
			value="no"
			class="btn h-auto flex-col p-6 preset-filled-error-500 hover:preset-tonal-error transition-all"
			disabled={submitting}
			onclick={(e) => {
				if (!confirm('Are you sure the outcome is NO?')) e.preventDefault();
			}}
		>
			<span class="text-lg font-bold">Resolve NO</span>
			<span class="text-sm opacity-80">Pay out NO holders</span>
		</button>

		<button
			type="submit"
			name="result"
			value="null"
			class="btn h-auto flex-col p-6 preset-filled-surface-500 hover:preset-tonal-surface transition-all"
			disabled={submitting}
			onclick={(e) => {
				if (!confirm('Are you sure the outcome is INVALID/DRAW?')) e.preventDefault();
			}}
		>
			<span class="text-lg font-bold">Resolve N/A (Refund)</span>
			<span class="text-sm opacity-80">Refund all positions</span>
		</button>
	</form>
</div>
