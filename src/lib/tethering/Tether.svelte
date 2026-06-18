<script lang="ts" module>
	export type SizeInheritMode = boolean | 'constrain';
</script>

<script lang="ts">
	import { type Snippet } from 'svelte';
	import Portal from '../portaling/Portal.svelte';
	import { useAnimationFrame } from '../util/animation-frame.svelte.ts';
	import {
		createElementSizeMeasurer,
		type ElementSizeMeasurer
	} from '../util/measure-element-size.ts';
	import { useTetherBoundary } from './TetherBoundary.svelte';
	import { computeTetherLayout, type Alignment, type TetherState } from './tether-layout.ts';

	export interface TetherProps {
		origin: Alignment;
		direction?: Alignment;
		inheritWidth?: SizeInheritMode;
		inheritHeight?: SizeInheritMode;

		/** If enabled, the horizontal alignment of the portal will be mirrored when there's not enough space. */
		wrapHorizontal?: boolean;
		/** If enabled, the vertical alignment of the portal will be mirrored when there's not enough space. */
		wrapVertical?: boolean;

		portal: Snippet<[state: TetherState]>;
		children: Snippet<[state: TetherState]>;
	}

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

	let childWidth = $state(0);
	let childHeight = $state(0);

	const layout = $derived(
		rect
			? computeTetherLayout({
					origin,
					direction,
					wrapHorizontal,
					wrapVertical,
					boundary,
					portalWidth: childWidth,
					portalHeight: childHeight,
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

{#if referenceWrapper}
	<Portal>
		<div
			class="popover"
			data-inherit-width={inheritWidth || undefined}
			data-inherit-height={inheritHeight || undefined}
			bind:clientWidth={childWidth}
			bind:clientHeight={childHeight}
			style:--x="{layout?.portalX ?? 0}px"
			style:--y="{layout?.portalY ?? 0}px"
			style:--w={rect ? `${rect.width}px` : undefined}
			style:--h={rect ? `${rect.height}px` : undefined}
		>
			{@render portal(tetherState)}
		</div>
	</Portal>
{/if}

<style>
	:global([data-tether]) {
		display: contents;
	}

	.popover {
		position: absolute;
		display: grid;
		transform: translate(var(--x), var(--y));

		&[data-inherit-width='true'] {
			width: var(--w);
		}
		&[data-inherit-width='constrain'] {
			max-width: var(--w);
		}

		&[data-inherit-height='true'] {
			height: var(--h);
		}
		&[data-inherit-height='constrain'] {
			max-height: var(--h);
		}
	}
</style>
