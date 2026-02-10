<script module lang="ts">
	
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';

	interface Props {
		options: echarts.EChartsOption;
		height?: string;
		width?: string;
		isDark?: boolean;
	}

	let { options, height = '500px', width = '100%', isDark = $bindable(false) }: Props = $props();

	let chartDom: HTMLDivElement;
	let myChart: echarts.ECharts | undefined;

	function initChart() {
		if (!chartDom) return;

		if (myChart) myChart.dispose();

		myChart = echarts.init(chartDom, isDark ? 'dark' : undefined);
		if (options) {
			myChart.setOption(options);
		}
	}

    // Re-initialize when theme changes
	$effect(() => {
        const _ = isDark;
        if (chartDom) {
            initChart();
        }
	});

	$effect(() => {
        if (myChart && options) {
            myChart.setOption(options);
        }
	});

	onMount(() => {
        isDark = document.documentElement.classList.contains('dark');
        
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					isDark = document.documentElement.classList.contains('dark');
				}
			});
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		const handleResize = () => myChart && myChart.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', handleResize);
			if (myChart) myChart.dispose();
		};
	});
</script>

<div bind:this={chartDom} style="width: {width}; {height ? `height: ${height};` : ''}"></div>
