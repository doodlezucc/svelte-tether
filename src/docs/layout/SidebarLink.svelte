<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Pathname } from '$app/types';
	import type { Snippet } from 'svelte';

	interface Props {
		path: Pathname;
		children: Snippet;
	}

	let { path, children }: Props = $props();

	let href = $derived(resolve(path));
	let isCurrentPage = $derived(href === page.url.pathname);
</script>

<li><a {href} class:current={isCurrentPage}>{@render children()}</a></li>

<style lang="scss">
	@use '$docs/style/scheme';

	li {
		list-style: none;
	}

	a {
		color: scheme.color('text');
	}

	.current {
		color: scheme.color('primary');
	}
</style>
