<script lang="ts" module>
	export type SizeInheritMode = boolean | 'constrain';
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Portal from '../portaling/Portal.svelte';
	import { useAnimationFrame } from '../util/animation-frame.svelte.ts';
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

		/** The wrapped HTML element used as a reference for positioning the portal (read-only). */
		wrappedElement?: HTMLElement;
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
		wrappedElement = $bindable()
	}: TetherProps = $props();

	const tetherBoundary = useTetherBoundary();

	let referenceWrapper = $state<HTMLElement>();
	let rect = $state<DOMRect>();
	let boundary = $state<DOMRect>();

	useAnimationFrame(() => {
		if (wrappedElement) {
			rect = wrappedElement.getBoundingClientRect();
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

	function findValidElement(parent: HTMLElement) {
		const children = parent.children;

		if (children.length !== 1) {
			wrappedElement = undefined;
			throw new Error('Tether must have exactly one child element');
		}

		const child = children[0] as HTMLElement;
		if (child.hasAttribute('data-tether')) {
			return findValidElement(child);
		} else {
			return child;
		}
	}

	function updateWrappedElement() {
		wrappedElement = findValidElement(referenceWrapper!);
	}

	onMount(() => {
		updateWrappedElement();

		const observer = new MutationObserver(() => {
			updateWrappedElement();
		});

		observer.observe(referenceWrapper!, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
		};
	});

	let tetherState = $derived<TetherState>(
		layout?.state ?? {
			isMirroredHorizontally: false,
			isMirroredVertically: false
		}
	);
</script>

<div data-tether bind:this={referenceWrapper}>
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
