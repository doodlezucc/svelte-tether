<script lang="ts" module>
	import type { TetherState } from '../tethering/Tether.svelte';

	interface TooltipState {
		tooltipId: string;
		isHovered: boolean;
		isFocused: boolean;
	}

	export type BaseTetherTooltipState = TooltipState & {
		tetherState: TetherState;
	};
</script>

<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { TetherProps } from '../tethering/Tether.svelte';
	import Tether from '../tethering/Tether.svelte';

	type Props = Omit<TetherProps, 'children' | 'portal'> & {
		children: Snippet<[state: BaseTetherTooltipState]>;
		tooltip: Snippet<[state: BaseTetherTooltipState]>;
	};

	let {
		children: wrappedChildren,
		tooltip,
		wrappedElement = $bindable(),
		...tetherProps
	}: Props = $props();

	let tooltipId = $props.id();
	let isHovered = $state(false);
	let isFocused = $state(false);

	function onPointerEnter() {
		isHovered = true;
	}

	function onPointerLeave() {
		isHovered = false;
	}

	function onFocus(ev: FocusEvent) {
		// The CSS pseudo-class :focus-visible (usually) only applies if the user
		// navigated to the target element with keyboard navigation.
		if (ev.target instanceof HTMLElement && ev.target.matches(':focus-visible')) {
			isFocused = true;
		}
	}

	function onBlur() {
		isFocused = false;
	}

	$effect(() => {
		const currentWrappedElement = wrappedElement;

		if (currentWrappedElement) {
			currentWrappedElement.setAttribute('aria-labelledby', tooltipId);
			currentWrappedElement.addEventListener('pointerenter', onPointerEnter);
			currentWrappedElement.addEventListener('pointerleave', onPointerLeave);
			currentWrappedElement.addEventListener('focus', onFocus);
			currentWrappedElement.addEventListener('blur', onBlur);

			return () => {
				currentWrappedElement.removeAttribute('aria-labelledby');
				currentWrappedElement.removeEventListener('pointerenter', onPointerEnter);
				currentWrappedElement.removeEventListener('pointerleave', onPointerLeave);
				currentWrappedElement.removeEventListener('focus', onFocus);
				currentWrappedElement.removeEventListener('blur', onBlur);
			};
		}
	});

	let tooltipState = $derived<TooltipState>({
		tooltipId,
		isHovered,
		isFocused
	});
</script>

<Tether {...tetherProps} bind:wrappedElement>
	{#snippet children(state)}
		{@render wrappedChildren({ ...tooltipState, tetherState: state })}
	{/snippet}

	{#snippet portal(state)}
		{@render tooltip({ ...tooltipState, tetherState: state })}
	{/snippet}
</Tether>
