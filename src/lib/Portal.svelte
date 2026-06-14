<script lang="ts">
	import { mount, unmount, untrack, type Snippet } from 'svelte';
	import { useOverlay } from './PortalOverlay.svelte';
	import SnippetRenderer from './util/SnippetRenderer.svelte';

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
		const destination = usedDestination;
		const mountedComponent = mount(SnippetRenderer, {
			props: { snippet: children },
			target: destination
		});

		return () => {
			unmount(mountedComponent, { outro: true });
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
