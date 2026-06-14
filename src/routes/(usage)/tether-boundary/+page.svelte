<script lang="ts">
	import CodeBlock from '$docs/CodeBlock.svelte';
	import Heading from '$docs/layout/Heading.svelte';
	import { useAnimationFrame } from '$lib/util/animation-frame.svelte.js';
	import { Tether, TetherBoundary } from 'svelte-tether';
	import { Spring } from 'svelte/motion';

	interface Point {
		x: number;
		y: number;
	}

	let outerBoundary = $state<HTMLElement>();
	let outerBoundaryRect = $state<DOMRect>();

	useAnimationFrame(() => {
		outerBoundaryRect = outerBoundary?.getBoundingClientRect();
	});

	let relativeOffset = $state<Point>({ x: 0.5, y: 0.5 });

	const offset = new Spring<Point>({ x: -1, y: -1 }, {});
	let isInitial = $derived(offset.target.x < 0);

	$effect(() => {
		if (outerBoundaryRect) {
			const absoluteOffset: Point = {
				x: relativeOffset.x * outerBoundaryRect.width,
				y: relativeOffset.y * outerBoundaryRect.height
			};

			offset.set(absoluteOffset, { instant: isInitial });
		}
	});

	let style = $derived(isInitial ? '' : `--x: ${offset.current.x}px; --y: ${offset.current.y}px`);

	function inferRelativeOffset(ev: PointerEvent) {
		if (!outerBoundaryRect) return;

		relativeOffset = {
			x: Math.min(Math.max((ev.x - outerBoundaryRect.left) / outerBoundaryRect.width, 0), 1),
			y: Math.min(Math.max((ev.y - outerBoundaryRect.top) / outerBoundaryRect!.height, 0), 1)
		};
	}

	let isPointerDown = $state(false);

	function onPointerDown(ev: PointerEvent) {
		ev.preventDefault();
		inferRelativeOffset(ev);
		isPointerDown = true;
	}

	function onPointerMove(ev: PointerEvent) {
		if (ev.buttons !== 0) {
			inferRelativeOffset(ev);
		}
	}
</script>

<svelte:window
	onpointermove={isPointerDown ? onPointerMove : undefined}
	onpointerup={() => (isPointerDown = false)}
/>

<Heading title="Tether Boundary" />

<p>
	By wrapping a <code>TetherBoundary</code> around a region of your page, you re-define the limits of
	where nested tethered elements (e.g. tooltips) can go.
</p>

<p><b>Click and drag</b> in the area below to see this in action.</p>

<div
	class="outer-boundary"
	bind:this={outerBoundary}
	onpointerdown={onPointerDown}
	role="presentation"
>
	<TetherBoundary>
		<div class="boundary">
			<span class="boundary-header">{'<TetherBoundary>'}</span>

			<Tether origin="top-left">
				{#snippet portal()}
					<span>top-left</span>
				{/snippet}

				<Tether origin="bottom-right">
					{#snippet portal()}
						<span>bottom-right</span>
					{/snippet}

					<div class="content" {style}></div>
				</Tether>
			</Tether>
		</div>
	</TetherBoundary>
</div>

<p>
	The <code>TetherBoundary</code> component is especially useful at the <b>top level</b> of your page.
	You can use a tether boundary in your outer most +layout.svelte to ensure that all tooltips and other
	popovers stay visible within the viewport.
</p>

<CodeBlock>
	{`./ExampleLayout.svelte`}
</CodeBlock>

<style lang="scss">
	@use '$docs/style/scheme';

	.outer-boundary {
		outline: 1px solid scheme.color('text');
		padding: calc(3vw + 40px);
		display: grid;
		place-content: stretch;
		position: relative;
		touch-action: pan-y;

		:global(*) {
			pointer-events: none;
		}
	}

	.boundary {
		outline: 1px solid scheme.color('text');
		height: 300px;
	}

	.boundary-header {
		position: absolute;
		transform: translateY(calc(-100% - 1px));
	}

	.content {
		background-color: scheme.color('primary');
		width: 50px;
		height: 50px;
		transform: translate(-25px, -25px);

		position: absolute;
		left: var(--x, 50%);
		top: var(--y, 50%);
	}

	span {
		padding: 0px 4px;
		outline: 1px solid scheme.color('primary');
	}
</style>
