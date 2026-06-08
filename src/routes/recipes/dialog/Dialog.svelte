<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Portal } from 'svelte-tether';

	interface Props {
		open: boolean;
		title: string;
		children: Snippet;
	}

	let { open = $bindable(), title, children }: Props = $props();

	let backdrop = $state<HTMLElement>();

	function onClick(ev: MouseEvent) {
		if (ev.target === backdrop) {
			open = false;
		}
	}
</script>

<svelte:window onclick={onClick} />

{#if open}
	<Portal modal>
		<div class="backdrop" bind:this={backdrop}>
			<div role="dialog">
				<h1>{title}</h1>

				{@render children()}
			</div>
		</div>
	</Portal>
{/if}

<style>
	.backdrop {
		width: 100%;
		height: 100%;
		background-color: #0005;

		display: grid;
		place-content: center;
	}

	h1 {
		margin: 0;
	}

	[role='dialog'] {
		background-color: white;
		color: black;
		padding: 16px 32px;
		margin: auto;
	}
</style>
