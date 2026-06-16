<script lang="ts" module>
	import { getContext } from 'svelte';

	// Exported only for use in the documentation pages
	export const BOUNDARY_CONTEXT_KEY = 'portal-tether-boundary';

	export interface TetherBoundaryContext {
		getRect: () => DOMRect | undefined;
	}

	export function useTetherBoundary() {
		return getContext<TetherBoundaryContext | undefined>(BOUNDARY_CONTEXT_KEY);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useAnimationFrame } from '../util/animation-frame.svelte.ts';

	interface Props {
		ignoreParentBoundary?: boolean;
		attributes?: Omit<HTMLAttributes<HTMLDivElement>, 'children'>;
		children: Snippet;
	}

	let { ignoreParentBoundary = false, attributes, children }: Props = $props();

	let wrapper = $state<HTMLElement>();
	let wrapperRect = $state<DOMRect>();

	useAnimationFrame(() => {
		if (wrapper) {
			wrapperRect = wrapper.getBoundingClientRect();
		}
	});

	const parentBoundary = getContext<TetherBoundaryContext | undefined>(BOUNDARY_CONTEXT_KEY);

	setContext<TetherBoundaryContext>(BOUNDARY_CONTEXT_KEY, {
		getRect: () => {
			if (!ignoreParentBoundary) {
				const parentRect = parentBoundary?.getRect();

				if (wrapperRect && parentRect) {
					const left = Math.max(wrapperRect.x, parentRect.x);
					const top = Math.max(wrapperRect.y, parentRect.y);
					const right = Math.min(wrapperRect.right, parentRect.right);
					const bottom = Math.min(wrapperRect.bottom, parentRect.bottom);

					return new DOMRect(left, top, right - left, bottom - top);
				}
			}

			return wrapperRect;
		}
	});
</script>

<div bind:this={wrapper} {...attributes}>
	{@render children()}
</div>
