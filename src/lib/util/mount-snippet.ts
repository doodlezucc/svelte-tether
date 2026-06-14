import { mount, unmount, type Snippet } from 'svelte';
import SnippetRenderer from './SnippetRenderer.svelte';

interface Options {
	parent: Element;
	snippet: Snippet;
}

interface MountedSnippet {
	unmount(): Promise<void>;
}

export function mountSnippet({ parent, snippet }: Options): MountedSnippet {
	const mountedComponent = mount(SnippetRenderer, {
		props: { snippet },
		target: parent
	});

	return {
		unmount: () => unmount(mountedComponent, { outro: true })
	};
}
