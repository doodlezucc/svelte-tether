<script lang="ts">
	import { Portal } from 'svelte-tether';

	let { useDestinationB }: { useDestinationB: boolean } = $props();

	let destinationA = $state<Element>();
	let destinationB = $state<Element>();

	let currentDestination = $derived(useDestinationB ? destinationB : destinationA);
</script>

<div class="destinations">
	<div bind:this={destinationA}></div>
	<div bind:this={destinationB}></div>
</div>

{#if currentDestination}
	<Portal destination={currentDestination}>
		<span>This is sample text.</span>
	</Portal>
{/if}

<style>
	.destinations {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 32px;
	}

	.destinations div {
		height: 60px;
		outline: 1px solid grey;
	}
</style>
