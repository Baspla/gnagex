<script lang="ts">
	import wip from '$lib/assets/wip.png';

	const {class: ClassValue = "h-32 w-32"} = $props();
</script>

<div class="inline-flex h-max w-max flex-row items-center justify-center space-y-4 p-4">
	<img src={wip} alt="Work In Progress" class="{ClassValue}" />
</div>
