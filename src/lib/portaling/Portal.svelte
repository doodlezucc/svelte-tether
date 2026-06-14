<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { mountSnippet } from './mount-snippet.ts';
	import { useOverlay } from './PortalOverlay.svelte';

	interface Props {
		modal?: boolean;

		/**
		 * The DOM element to mount this snippet in. Defaults to the `<PortalOverlay>`.
		 */
		destination?: Element;
		children: Snippet;
	}

	let { modal = false, destination, children }: Props = $props();

	const overlay = useOverlay();
	let usedDestination = $derived(destination ?? overlay.destination);

	$effect(() => {
		const mountedSnippet = mountSnippet({
			parent: usedDestination,
			snippet: children
		});

		return () => {
			mountedSnippet.unmount();
		};
	});

	$effect(() => {
		if (modal) {
			const mountedModal = untrack(() => overlay.mountModal());

			return () => {
				mountedModal.unmount();
			};
		}
	});
</script>
