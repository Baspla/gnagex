<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let currencies = $derived(data.currencies);
	let loading = $state(false);
</script>

<div>
	<h1>Create New Prediction Market</h1>

	{#if form?.error}
		<div>{form.error}</div>
	{/if}
	{#if form?.missing}
		<div>Please fill in all fields.</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				update();
			};
		}}
	>
		<div>
			<label for="title">Title</label>
			<input
				id="title"
				name="title"
				required
				placeholder="e.g. Will Bitcoin reach $100k by 2025?"
			/>
		</div>
		<div>
			<label for="description">Description</label>
			<textarea
				id="description"
				name="description"
				required
				rows="3"
			></textarea>
		</div>
		<div>
			<div>
				<label for="endDate">End Date</label>
				<input
					id="endDate"
					name="endDate"
					type="datetime-local"
					required
				/>
			</div>
			<div>
				<label for="currencyId">Currency</label>
				<select
					id="currencyId"
					name="currencyId"
					required
				>
					{#each currencies as currency}
						<option value={currency.id}>{currency.name} ({currency.symbol})</option>
					{/each}
				</select>
			</div>
		</div>
		<div>
			<label for="poolSize">Initial Pool Size</label>
			<p>Total initial liquidity (split 50/50 YES/NO).</p>
			<input
				id="poolSize"
				name="poolSize"
				type="number"
				min="10"
				step="0.01"
				required
				placeholder="1000"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
		>
			{loading ? 'Creating Market...' : 'Create Market'}
		</button>
	</form>
</div>
