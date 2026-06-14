<script lang="ts" module>
	export type Alignment = keyof typeof ALIGNMENT_MAPPING;

	const TOP = 0;
	const LEFT = 0;
	const BOTTOM = 1;
	const RIGHT = 1;
	const CENTER = 0.5;

	const ALIGNMENT_MAPPING = {
		'top-left': [LEFT, TOP],
		'top-center': [CENTER, TOP],
		'top-right': [RIGHT, TOP],
		'center-left': [LEFT, CENTER],
		center: [CENTER, CENTER],
		'center-right': [RIGHT, CENTER],
		'bottom-left': [LEFT, BOTTOM],
		'bottom-center': [CENTER, BOTTOM],
		'bottom-right': [RIGHT, BOTTOM]
	};

	export type SizeInheritMode = boolean | 'constrain';

	export interface TetherState {
		isMirroredHorizontally: boolean;
		isMirroredVertically: boolean;
	}
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Portal from './Portal.svelte';
	import { useTetherBoundary } from './TetherBoundary.svelte';
	import { useAnimationFrame } from './util/animation-frame.svelte.ts';

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

	let minX = $derived(!boundary ? Number.NEGATIVE_INFINITY : boundary.left);
	let minY = $derived(!boundary ? Number.NEGATIVE_INFINITY : boundary.top);
	let maxX = $derived(!boundary ? Number.POSITIVE_INFINITY : boundary.right - childWidth);
	let maxY = $derived(!boundary ? Number.POSITIVE_INFINITY : boundary.bottom - childHeight);

	let originHorizontal = $derived(ALIGNMENT_MAPPING[origin][0]);
	let originVertical = $derived(ALIGNMENT_MAPPING[origin][1]);

	let alignHorizontal = $derived(ALIGNMENT_MAPPING[direction][0]);
	let alignVertical = $derived(ALIGNMENT_MAPPING[direction][1]);

	let childXUnclamped = $derived(
		!rect ? 0 : rect.x + originHorizontal * rect.width - childWidth * (1 - alignHorizontal)
	);
	let childYUnclamped = $derived(
		!rect ? 0 : rect.y + originVertical * rect.height - childHeight * (1 - alignVertical)
	);

	let wrapLeftToRight = $derived(alignHorizontal === LEFT && childXUnclamped - minX < 0);
	let wrapRightToLeft = $derived(alignHorizontal === RIGHT && maxX - childXUnclamped < 0);
	let wrapTopToBottom = $derived(alignVertical === TOP && childYUnclamped - minY < 0);
	let wrapBottomToTop = $derived(alignVertical === BOTTOM && maxY - childYUnclamped < 0);

	let applyMirrorHorizontal = $derived(wrapHorizontal && (wrapLeftToRight || wrapRightToLeft));
	let applyMirrorVertical = $derived(wrapVertical && (wrapBottomToTop || wrapTopToBottom));

	let childXWrappedUnclamped = $derived(
		!applyMirrorHorizontal || !rect
			? childXUnclamped
			: rect.x + (1 - originHorizontal) * rect.width - childWidth * alignHorizontal
	);
	let childYWrappedUnclamped = $derived(
		!applyMirrorVertical || !rect
			? childYUnclamped
			: rect.y + (1 - originVertical) * rect.height - childHeight * alignVertical
	);

	let childX = $derived(Math.min(Math.max(childXWrappedUnclamped, minX), maxX));
	let childY = $derived(Math.min(Math.max(childYWrappedUnclamped, minY), maxY));

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

	let tetherState = $derived<TetherState>({
		isMirroredHorizontally: applyMirrorHorizontal,
		isMirroredVertically: applyMirrorVertical
	});

	let style = $derived.by(() => {
		if (!rect) {
			return `--x: ${childX}px; --y: ${childY}px`;
		} else {
			return `--x: ${childX}px; --y: ${childY}px; --w: ${rect.width}px; --h: ${rect.height}px`;
		}
	});
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
			{style}
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
