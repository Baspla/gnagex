<script lang="ts">
  import WorkInProgress from '$lib/components/WorkInProgress.svelte';
  import Chart from '$lib/components/Chart.svelte';

  let { form } = $props();

  // Your static data: [Date, Open, Close, Lowest, Highest]
  const data = [
    ['2024-01-01', 2320.26, 2320.26, 2287.3, 2362.94],
    ['2024-01-02', 2300, 2291.3, 2288.26, 2308.38],
    ['2024-01-03', 2295.35, 2346.5, 2295.35, 2345.92],
    // ... add more static data here
  ];
</script>

<div class="container mx-auto p-4">
  <h1 class="mb-4 text-2xl font-bold inline-flex items-center ">
    Testing
    <WorkInProgress class="size-10" />
  </h1>
  <Chart {data} />
</div>

