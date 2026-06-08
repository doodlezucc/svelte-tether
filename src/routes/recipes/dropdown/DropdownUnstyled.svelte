<script lang="ts">
	import { Tether } from 'svelte-tether';
	import { fade } from 'svelte/transition';

	interface Props {
		options: string[];
		value: string;
	}

	let { options, value = $bindable() }: Props = $props();

	let expanded = $state(false);
	let popupId = $props.id();

	function onSelect(option: string) {
		value = option;
		expanded = false;
	}

	function onOptionKeyDown(option: string, ev: KeyboardEvent) {
		if (ev.key === ' ' || ev.key === 'Enter') {
			ev.preventDefault();
			onSelect(option);
		}
	}

	function onDropdownKeyDown(ev: KeyboardEvent) {
		if (ev.key === 'Escape') {
			ev.preventDefault();
			expanded = false;
		} else if (ev.key === ' ' || ev.key === 'Enter') {
			ev.preventDefault();
			expanded = !expanded;
		} else if (ev.key === 'ArrowUp') {
			ev.preventDefault();
			value = options[(options.indexOf(value) + options.length - 1) % options.length];
		} else if (ev.key === 'ArrowDown') {
			ev.preventDefault();
			value = options[(options.indexOf(value) + 1) % options.length];
		}
	}
</script>

<svelte:window onmouseup={expanded ? () => (expanded = false) : undefined} />

<Tether origin="bottom-center" inheritWidth wrapVertical>
	<div
		role="combobox"
		aria-controls={popupId}
		aria-expanded={expanded}
		tabindex="0"
		onclick={() => (expanded = true)}
		onkeydown={onDropdownKeyDown}
	>
		<span>{value}</span>
	</div>

	{#snippet portal()}
		{#if expanded}
			<ul role="listbox" id={popupId} transition:fade={{ duration: 100 }}>
				{#each options as option (option)}
					<li
						role="option"
						aria-selected={value === option}
						tabindex="0"
						onmousedown={() => onSelect(option)}
						onkeydown={(ev) => onOptionKeyDown(option, ev)}
					>
						{option}
					</li>
				{/each}
			</ul>
		{/if}
	{/snippet}
</Tether>

<style>
	[role='combobox'] {
		background-color: white;
		color: black;
		border: 1px solid black;
		padding: 10px 12px;
		width: 300px;
		cursor: pointer;
	}

	[role='listbox'] {
		background-color: white;
		color: black;
		outline: 1px solid black;
		margin: 0 1px;
		padding-inline-start: 0;
	}

	[role='option'] {
		list-style: none;
		padding: 6px 16px;
		cursor: pointer;
	}

	[role='option']:hover {
		background-color: #888;
	}

	[role='option'][aria-selected='true'] {
		font-weight: 600;
	}
</style>
