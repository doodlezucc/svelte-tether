<script lang="ts" module>
	import type { TetherState } from '../tethering/tether-layout.ts';

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
	import type { Attachment } from 'svelte/attachments';
	import type { TetherProps } from '../tethering/Tether.svelte';
	import Tether from '../tethering/Tether.svelte';
	import { createMutationObserverAttachment } from '../util/observer-attachment.svelte.ts';

	type Props = Omit<TetherProps, 'children' | 'portal'> & {
		children: Snippet<[state: BaseTetherTooltipState]>;
		tooltip: Snippet<[state: BaseTetherTooltipState]>;
	};

	let { children: wrappedChildren, tooltip, ...tetherProps }: Props = $props();

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

	function getWrappedHTMLElement(tetherWrapper: Element): HTMLElement | null {
		return [...tetherWrapper.children].find((child) => child instanceof HTMLElement) ?? null;
	}

	function createEventListenersAttachment(): Attachment<Element> {
		return createMutationObserverAttachment({
			// Only observe mutations to the direct children of the <Tether> wrapper element
			observerOptions: { childList: true },
			resolveRelative: getWrappedHTMLElement,

			relativeAttachment: (wrappedElement) => {
				wrappedElement.setAttribute('aria-labelledby', tooltipId);
				wrappedElement.addEventListener('pointerenter', onPointerEnter);
				wrappedElement.addEventListener('pointerleave', onPointerLeave);
				wrappedElement.addEventListener('focus', onFocus);
				wrappedElement.addEventListener('blur', onBlur);

				return () => {
					wrappedElement.removeAttribute('aria-labelledby');
					wrappedElement.removeEventListener('pointerenter', onPointerEnter);
					wrappedElement.removeEventListener('pointerleave', onPointerLeave);
					wrappedElement.removeEventListener('focus', onFocus);
					wrappedElement.removeEventListener('blur', onBlur);
				};
			}
		});
	}

	let tooltipState = $derived<TooltipState>({
		tooltipId,
		isHovered,
		isFocused
	});
</script>

<Tether {...tetherProps} {@attach createEventListenersAttachment()}>
	{#snippet children(state)}
		{@render wrappedChildren({ ...tooltipState, tetherState: state })}
	{/snippet}

	{#snippet portal(state)}
		{@render tooltip({ ...tooltipState, tetherState: state })}
	{/snippet}
</Tether>
