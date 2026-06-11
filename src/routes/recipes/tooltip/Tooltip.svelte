<script lang="ts">
	import { type Snippet } from 'svelte';
	import { BaseTetherTooltip, type Alignment } from 'svelte-tether';

	interface Props {
		alignment?: Alignment;
		children: Snippet;
		title: Snippet;
	}

	let { alignment = 'top-center', children, title }: Props = $props();
</script>

<BaseTetherTooltip origin={alignment}>
	{@render children()}

	{#snippet tooltip({ tooltipId, isHovered, isFocused })}
		{@const isVisible = isHovered || isFocused}

		<div id={tooltipId} role="tooltip" class:visible={isVisible} aria-hidden="true">
			{@render title()}
		</div>
	{/snippet}
</BaseTetherTooltip>

<style>
	[role='tooltip'] {
		pointer-events: none;
		user-select: none;

		padding: 4px 12px;
		background-color: black;
		color: white;

		transition: 0.1s;
		opacity: 0;
		margin: 0;
	}

	[role='tooltip'].visible {
		opacity: 1;
		margin: 4px;
	}
</style>
