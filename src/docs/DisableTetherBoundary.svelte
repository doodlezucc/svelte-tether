<script lang="ts" module>
	/**
	 * You shouldn't normally try to break out of a tether boundary.
	 * This wrapper is useful for the vertical flow of the documentation pages, just so that
	 * examples of the <Tether> component don't get stuck at the bottom or the top of the page.
	 */
</script>

<script lang="ts">
	import {
		BOUNDARY_CONTEXT_KEY,
		type TetherBoundaryContext
	} from '$lib/tethering/TetherBoundary.svelte';
	import { setContext, type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	setContext<TetherBoundaryContext>(BOUNDARY_CONTEXT_KEY, {
		getRect: () => undefined
	});
</script>

{@render children()}
