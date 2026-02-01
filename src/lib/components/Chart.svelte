<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';

	interface Props {
		data: {
			open: number | null;
			close: number;
			date: Date;
			id: string;
			assetId: string;
			high: number | null;
			low: number | null;
			volume: number | null;
		}[];
		title?: string;
		height?: string;
	}

	let { data, title = 'Stock Performance', height = '500px' }: Props = $props();

	let chartDom: HTMLDivElement;
	let myChart: echarts.ECharts | undefined;

	function initChart() {
		if (!chartDom) return;

		if (myChart) myChart.dispose();

		// Check for "dark" class on the html element for Tailwind dark mode
		const isDark = document.documentElement.classList.contains('dark');

		// Initialize ECharts with the appropriate theme ('dark' or default)
		myChart = echarts.init(chartDom, isDark ? 'dark' : undefined);

		updateChart();
	}

	function updateChart() {
		if (!myChart) return;

		const isDark = document.documentElement.classList.contains('dark');

		// Sort data by date ascending so the chart goes from left (old) to right (new)
		const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		const option = {
			backgroundColor: 'transparent',
			title: {
				text: title,
				left: 0,
				textStyle: { color: isDark ? '#FFF' : '#1f2937' } // Adapt title color
			},
			tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
			grid: { left: '10%', right: '10%', bottom: '15%' },
			xAxis: {
				type: 'category',
				data: sortedData.map((item) => item.date.toISOString().split('T')[0]),
				axisLabel: { color: isDark ? '#9ca3af' : '#4b5563' }
			},
			yAxis: {
				scale: true,
				axisLabel: { color: isDark ? '#9ca3af' : '#4b5563' },
				splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb' } }
			},
			dataZoom: [{ type: 'inside', start: 50, end: 100 }, { type: 'slider' }],
			series: [
				{
					type: 'candlestick',
					data: sortedData.map((item) => [item.open, item.close, item.low, item.high]),
					itemStyle: {
						color: '#26a69a', // Bullish color (Green)
						color0: '#ef5350', // Bearish color (Red)
						borderColor: '#26a69a',
						borderColor0: '#ef5350'
					}
				}
			]
		};

		myChart.setOption(option);
	}

	// React to data changes
	$effect(() => {
		// Register dependencies
		const _d = data;
		const _t = title;

		if (myChart) {
			updateChart();
		}
	});

	onMount(() => {
		initChart();

		// Listen for dark mode toggle
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					initChart();
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

<div bind:this={chartDom} style="width: 100%; height: {height};"></div>
