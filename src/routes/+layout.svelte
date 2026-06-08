<script lang="ts">
	import '$docs/style/index.scss';
	import '@fontsource-variable/montserrat/wght.css';
	import '@fontsource-variable/roboto-mono/wght.css';
	import '@fontsource/merriweather/400.css';
	import '@fontsource/merriweather/700.css';

	import Content from '$docs/layout/Content.svelte';
	import Header from '$docs/layout/Header.svelte';
	import Sidebar from '$docs/layout/Sidebar.svelte';
	import type { Snippet } from 'svelte';
	import { PortalOverlay, TetherBoundary } from 'svelte-tether';

	interface Props {
		children: Snippet;
	}

	let { children: layoutChildren }: Props = $props();
</script>

<PortalOverlay>
	{#snippet children({ hasModals })}
		<TetherBoundary attributes={{ class: 'global-layout', inert: hasModals }}>
			<Header />

			<main>
				<Sidebar />

				<Content>
					{@render layoutChildren()}
				</Content>
			</main>
		</TetherBoundary>
	{/snippet}
</PortalOverlay>

<style lang="scss">
	:global(.global-layout) {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	main {
		flex: 1;
		position: relative;
		overflow: hidden;
		display: flex;
	}
</style>
