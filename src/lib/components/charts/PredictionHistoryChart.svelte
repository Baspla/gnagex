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
				let result = `${date.toLocaleString()}<br/>`;
				params.forEach((p: any) => {
					result += `${p.marker} ${p.seriesName}: ${(p.value[1] * 100).toFixed(2)}%<br/>`;
				});
				return result;
			}
		},
		legend: {
			data: ['Yes', 'No'],
			top: 0,
			textStyle: {
				color: 'inherit'
			}
		},
		xAxis: {
			type: 'time',
			boundaryGap: ['20%', '20%']
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
				name: 'Yes',
				data: history.map((h) => [h.date, h.probability]),
				type: 'line',
				smooth: true,
				areaStyle: {
					opacity: 0.1
				},
				itemStyle: {
					color: '#22c55e' // Green-500
				},
				showSymbol: false
			},
			{
				name: 'No',
				data: history.map((h) => [h.date, 1 - h.probability]),
				type: 'line',
				smooth: true,
				areaStyle: {
					opacity: 0.1
				},
				itemStyle: {
					color: '#ef4444' // Red-500
				},
				showSymbol: false
			}
		],
		grid: {
			top: 30,
			bottom: 20,
			left: 50,
			right: 20
		}
	});
</script>

<div class="">
	<h3 class="">Probability History</h3>
	<BaseChart {options} {height} />
</div>
