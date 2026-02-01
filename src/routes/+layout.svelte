<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import {
		ChartNoAxesCombined,
		LayoutDashboardIcon,
		CrownIcon,
		BriefcaseBusinessIcon,
		TrendingUpDownIcon,
		TicketsIcon,
		HistoryIcon,
		PaletteIcon,
		HammerIcon,
	} from '@lucide/svelte';
	import { Menu, Navigation, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { LayoutProps } from './$types';

	const links = [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
		{ label: 'Market', href: '/market', icon: TrendingUpDownIcon },
		{ label: 'Predictions', href: '/predictions', icon: TicketsIcon },
		{ label: 'Portfolios', href: '/portfolios', icon: BriefcaseBusinessIcon },
		{ label: 'Transactions', href: '/transactions', icon: HistoryIcon },
		{ label: 'Leaderboard', href: '/leaderboard', icon: CrownIcon }
	];

	let { data, children }: LayoutProps = $props();
	let innerWidth: number = $state(0);
</script>

<svelte:head
	><link rel="icon" href={favicon} />
	<title>Gnag Exchange</title>
</svelte:head>
<svelte:window bind:innerWidth />
<div class="flex {innerWidth < 768 ? 'flex-col' : 'flex-row'} h-screen w-screen overflow-hidden">
	{#if innerWidth >= 768}
		<Navigation layout={'rail'} class="overflow-y-auto backdrop-blur-lg">
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
					{#if data.user?.isAdmin}
						<Navigation.TriggerAnchor>
							<Menu positioning={{ placement: 'right-start', strategy: 'absolute' }}>
								<Menu.Trigger class="flex flex-col items-center gap-3">
									<HammerIcon class="size-5" />
									<Navigation.TriggerText>Admin</Navigation.TriggerText>
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											<Menu.Item value="admin-overview">
												<a href="/admin" class="flex w-full h-full">
												<Menu.ItemText>Overview</Menu.ItemText></a>
											</Menu.Item>
											<Menu.Separator />
											<Menu.Item value="user-management" >
												<a href="/admin/users" class="flex w-full h-full">
												<Menu.ItemText>Users</Menu.ItemText></a>
											</Menu.Item>
											<Menu.Item value="asset-management">
												<a href="/admin/assets" class="flex w-full h-full">
												<Menu.ItemText>Assets</Menu.ItemText>
												</a>
											</Menu.Item>
											<Menu.Item value="prediction-management">
												<a href="/admin/predictions" class="flex w-full h-full">
												<Menu.ItemText>Predictions</Menu.ItemText>
												</a>
											</Menu.Item>
											<Menu.Item value="portfolio-management">
												<a href="/admin/portfolios" class="flex w-full h-full">
												<Menu.ItemText>Portfolios</Menu.ItemText>
												</a>
											</Menu.Item>
											<Menu.Item value="currency-management">
												<a href="/admin/currencies" class="flex w-full h-full">
												<Menu.ItemText>Currencies</Menu.ItemText>
												</a>
											</Menu.Item>
											<Menu.Item value="exchange-rate-management">
												<a href="/admin/exchange-rates" class="flex w-full h-full">
												<Menu.ItemText>Exchange Rates</Menu.ItemText>
												</a>
											</Menu.Item>
										</Menu.Content>
									</Menu.Positioner>
								</Portal>
							</Menu>
						</Navigation.TriggerAnchor>
					{/if}
				</Navigation.Menu>
			</Navigation.Content>
			<Navigation.Footer class="flex flex-col items-center">
				<ThemeSwitcher>
					<Navigation.TriggerAnchor>
						<PaletteIcon class="size-5" />
						<Navigation.TriggerText>Themes</Navigation.TriggerText>
					</Navigation.TriggerAnchor>
				</ThemeSwitcher>
			</Navigation.Footer>
		</Navigation>
		<div class="flex h-full w-full overflow-auto p-6">
			{@render children()}
		</div>
	{:else}
		<div class="flex h-full w-full overflow-auto p-6">
			{@render children()}
		</div>
		<Navigation layout={'bar'} class="overflow-y-hidden backdrop-blur-lg">
			<Navigation.Content>
				<Navigation.Menu class="flex w-full justify-around overflow-x-auto">
					{#each links as link (link.href)}
						{@const Icon = link.icon}
						<Navigation.TriggerAnchor href={link.href}>
							<Icon class="size-5" />
							<Navigation.TriggerText>{link.label}</Navigation.TriggerText>
						</Navigation.TriggerAnchor>
					{/each}
					<ThemeSwitcher>
						<Navigation.TriggerAnchor>
							<PaletteIcon class="size-5" />
							<Navigation.TriggerText>Themes</Navigation.TriggerText>
						</Navigation.TriggerAnchor>
					</ThemeSwitcher>
				</Navigation.Menu>
			</Navigation.Content>
		</Navigation>
	{/if}
</div>
