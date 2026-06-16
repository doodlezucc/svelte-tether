import { mount, unmount, type Snippet } from 'svelte';
import SnippetRenderer from './SnippetRenderer.svelte';

interface Options {
	/** The DOM element to mount the `snippet` in. Any top-level nodes rendered via the `snippet` will be direct child nodes of this element. */
	parent: Element;
	snippet: Snippet;
}

interface MountedSnippet {
	/**
	 * Removes the mounted snippet from the DOM.
	 *
	 * If `options.outro` is `true`, [transitions](https://svelte.dev/docs/svelte/transition) will play before the component is removed from the DOM.
	 *
	 * Returns a `Promise` that resolves after transitions have completed if `options.outro` is true, or immediately otherwise.
	 */
	unmount(options?: Parameters<typeof unmount>[1]): Promise<void>;
}

/**
 * Mounts a Svelte snippet to the DOM as children of the specified `parent` element.
 */
export function mountSnippet({ parent, snippet }: Options): MountedSnippet {
	const mountedComponent = mount(SnippetRenderer, {
		props: { snippet },
		target: parent
	});

	return {
		unmount: (options) => unmount(mountedComponent, options)
	};
}
