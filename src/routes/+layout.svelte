<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import {
		ChartNoAxesCombined,
		LayoutDashboardIcon,
		CrownIcon,
		BriefcaseBusinessIcon,
		TrendingUpDownIcon,
		TicketsIcon,
		HistoryIcon,
		PaletteIcon
	} from '@lucide/svelte';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';

	const links = [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
		{ label: 'Market', href: '/market', icon: TrendingUpDownIcon },
		{ label: 'Predictions', href: '/predictions', icon: TicketsIcon },
		{ label: 'Portfolio', href: '/portfolio', icon: BriefcaseBusinessIcon },
		{ label: 'Transactions', href: '/transactions', icon: HistoryIcon },
		{ label: 'Leaderboard', href: '/leaderboard', icon: CrownIcon }
	];

	let { children } = $props();
</script>

<svelte:head
	><link rel="icon" href={favicon} />
	<title>Gnag Exchange</title>
</svelte:head>
<div class="flex h-screen w-full">
	<!-- --- -->
	<Navigation layout="rail">
		<Navigation.Header>
			<Navigation.TriggerAnchor href="/" title="Gnag Exchange" aria-label="View Homepage">
				<ChartNoAxesCombined class="size-8" />
			</Navigation.TriggerAnchor>
		</Navigation.Header>
		<Navigation.Content>
			<Navigation.Menu>
				{#each links as link (link.href)}
					{@const Icon = link.icon}
					<Navigation.TriggerAnchor href={link.href}>
						<Icon class="size-5" />
						<Navigation.TriggerText>{link.label}</Navigation.TriggerText>
					</Navigation.TriggerAnchor>
				{/each}
			</Navigation.Menu>
		</Navigation.Content>
		<Navigation.Footer>
			<ThemeSwitcher>
				<Navigation.TriggerAnchor>
					<PaletteIcon class="size-5" />
					<Navigation.TriggerText>Themes</Navigation.TriggerText>
				</Navigation.TriggerAnchor>
			</ThemeSwitcher>
		</Navigation.Footer>
	</Navigation>
	<!-- --- -->
	<div class="flex w-full overflow-auto p-6">
		{@render children()}
	</div>
</div>
