<script lang="ts">
	import BaseChart from './BaseChart.svelte';
	import type { EChartsOption } from 'echarts';

	interface HistoryPoint {
		date: Date;
		probability: number;
	}

	interface Props {
		history: HistoryPoint[];
		height?: string;
	}

	let { history, height = '300px' }: Props = $props();

	let options: EChartsOption = $derived({
		tooltip: {
			trigger: 'axis',
			formatter: (params: any) => {
				const date = new Date(params[0].value[0]);
				const prob = params[0].value[1];
				return `${date.toLocaleString()}<br/>Probability (Yes): ${(prob * 100).toFixed(2)}%`;
			}
		},
		xAxis: {
			type: 'time',
			boundaryGap: false
		},
		yAxis: {
			type: 'value',
			min: 0,
			max: 1,
			axisLabel: {
				formatter: (value: number) => `${(value * 100).toFixed(0)}%`
			}
		},
		series: [
			{
				data: history.map((h) => [h.date, h.probability]),
				type: 'line',
				smooth: true,
				areaStyle: {
					opacity: 0.3
				},
				itemStyle: {
					color: '#2563eb' // Blue-600
				},
				showSymbol: false
			}
		],
		grid: {
			top: 20,
			bottom: 20,
			left: 50,
			right: 20
		}
	});
</script>

<div class="">
	<h3 class="">Probability History (Yes)</h3>
	<BaseChart {options} {height} />
</div>
