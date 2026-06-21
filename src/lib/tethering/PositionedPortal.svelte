<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import Portal from '../portaling/Portal.svelte';
	import type { SizeInheritMode, TetherState } from './common-types.ts';
	import type { TetherLayout } from './tether-layout.ts';

	interface Props {
		inheritWidth: SizeInheritMode;
		inheritHeight: SizeInheritMode;

		anchorWidth: number;
		anchorHeight: number;
		layout: TetherLayout;

		onPortalMeasured: (width: number, height: number) => void;

		snippet: Snippet<[state: TetherState]>;
	}

	let {
		inheritWidth,
		inheritHeight,
		anchorWidth,
		anchorHeight,
		layout,
		onPortalMeasured,
		snippet
	}: Props = $props();

	let tetherState = $derived<TetherState>(layout.state);
	let element = $state<Element>();

	function handleResize(entries: ResizeObserverEntry[]) {
		const borderBoxSize = entries.at(0)?.borderBoxSize.at(0);

		if (borderBoxSize !== undefined) {
			onPortalMeasured(borderBoxSize.inlineSize, borderBoxSize.blockSize);
		}
	}

	// This effect adds a ResizeObserver to the popover element as soon as it's mounted.
	$effect(() => {
		const mountedElement = element;
		if (!mountedElement) return;

		return untrack(() => {
			const resizeObserver = new ResizeObserver((entries) => handleResize(entries));
			resizeObserver.observe(mountedElement);

			return () => {
				resizeObserver.disconnect();
			};
		});
	});
</script>

<Portal>
	<div
		bind:this={element}
		class="popover"
		data-inherit-width={inheritWidth || undefined}
		data-inherit-height={inheritHeight || undefined}
		style:--x="{layout.portalX}px"
		style:--y="{layout.portalY}px"
		style:--w="{anchorWidth}px"
		style:--h="{anchorHeight}px"
	>
		{@render snippet(tetherState)}
	</div>
</Portal>

<style>
	.popover {
		pointer-events: none;
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

	:where(.popover > :global(*)) {
		pointer-events: all;
	}
</style>
