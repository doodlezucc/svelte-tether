<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { Snippet } from 'svelte';

	interface Props {
		path: Pathname;
		children: Snippet;
	}

	let { path, children }: Props = $props();
</script>

<a href={resolve(path)}>{@render children()}</a>
