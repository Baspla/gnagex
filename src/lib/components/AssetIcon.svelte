<script lang="ts">
	import { env } from '$env/dynamic/public';

	const {
		asset,
		class: className = '',
		shape = 'square'
	}: {
		asset: { symbol: string; name: string };
		class?: string;
		shape?: 'square' | 'circle' | 'rounded';
	} = $props();
</script>

<img
	src="https://img.logo.dev/ticker/{asset.symbol}?token={env.PUBLIC_LOGO_DEV_TOKEN}"
	alt="{asset.name} logo"
	class={className}
    class:rounded={shape === 'rounded'}
    class:rounded-full={shape === 'circle'}
    class:square={shape === 'square'}
/>
