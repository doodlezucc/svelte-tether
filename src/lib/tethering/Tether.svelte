<script lang="ts">
	import { type Snippet } from 'svelte';
	import { useAnimationFrame } from '../util/animation-frame.svelte.ts';
	import {
		createElementSizeMeasurer,
		type ElementSizeMeasurer
	} from '../util/measure-element-size.ts';
	import PositionedTetherPortal from './PositionedPortal.svelte';
	import { useTetherBoundary } from './TetherBoundary.svelte';
	import type { TetherOptions } from './tether-attachment.svelte.ts';
	import { computeTetherLayout, type TetherState } from './tether-layout.ts';

	export type TetherProps = TetherOptions & {
		portal: Snippet<[state: TetherState]>;
		children: Snippet<[state: TetherState]>;
	};

	let {
		origin,
		direction = origin,
		inheritWidth = false,
		inheritHeight = false,
		wrapHorizontal = false,
		wrapVertical = false,
		portal,
		children,
		...attachments
	}: TetherProps = $props();

	const tetherBoundary = useTetherBoundary();

	let referenceWrapper = $state<HTMLElement>();
	let rect = $state<DOMRect>();
	let boundary = $state<DOMRect>();

	let elementSizeMeasurer: ElementSizeMeasurer | undefined;

	useAnimationFrame(() => {
		if (elementSizeMeasurer) {
			rect = elementSizeMeasurer.measureRect();
		}

		const overlayRect = tetherBoundary?.getRect();
		if (overlayRect) {
			boundary = overlayRect;
		}
	});

	let portalWidth = $state(0);
	let portalHeight = $state(0);

	const layout = $derived(
		rect
			? computeTetherLayout({
					origin,
					direction,
					wrapHorizontal,
					wrapVertical,
					boundary,
					portalWidth,
					portalHeight,
					anchor: rect
				})
			: undefined
	);

	$effect(() => {
		if (referenceWrapper) {
			const measurer = createElementSizeMeasurer(referenceWrapper);
			elementSizeMeasurer = measurer;

			return () => {
				measurer.dispose();
			};
		}
	});

	let tetherState = $derived<TetherState>(
		layout?.state ?? {
			isMirroredHorizontally: false,
			isMirroredVertically: false
		}
	);
</script>

<div data-tether bind:this={referenceWrapper} {...attachments}>
	{@render children(tetherState)}
</div>

{#if referenceWrapper && rect && layout}
	<PositionedTetherPortal
		{inheritWidth}
		{inheritHeight}
		anchorWidth={rect.width}
		anchorHeight={rect.height}
		{layout}
		snippet={portal}
		onPortalMeasured={(width, height) => {
			portalWidth = width;
			portalHeight = height;
		}}
	/>
{/if}

<style>
	:global([data-tether]) {
		display: contents;
	}
</style>
