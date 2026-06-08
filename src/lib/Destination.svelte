<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import SnippetRenderer from './SnippetRenderer.svelte';

	export interface MountedPortal {
		unmount(): void;
	}

	export interface IDestination {
		mountPortal(snippet: Snippet): MountedPortal;
	}
</script>

<script lang="ts">
	import { mount, unmount } from 'svelte';

	let element = $state<Element>();

	export function mountPortal(snippet: Snippet): MountedPortal {
		if (!element) {
			throw new Error('Destination element not mounted yet');
		}

		const mountedComponent = mount(SnippetRenderer, { props: { snippet }, target: element });

		return {
			unmount: () => unmount(mountedComponent, { outro: true })
		};
	}
</script>

<div bind:this={element} style:display="contents"></div>
