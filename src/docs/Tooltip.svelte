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
		<div aria-hidden="true" role="tooltip" id={tooltipId} class:visible={isHovered || isFocused}>
			{@render title()}
		</div>
	{/snippet}
</BaseTetherTooltip>

<style lang="scss">
	@use '$docs/style/scheme';

	[role='tooltip'] {
		pointer-events: none;
		user-select: none;

		padding: 4px 12px;
		background-color: scheme.color('tooltip-background');
		color: scheme.color('tooltip-text');
		font-size: 0.8rem;
		font-weight: 500;

		transition: 0.1s;
		opacity: 0;
		margin: 0;

		&.visible {
			opacity: 1;
			margin: 4px;
		}
	}
</style>
