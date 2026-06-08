<script lang="ts">
	import { resolve } from '$app/paths';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SendToBackIcon from '@lucide/svelte/icons/send-to-back';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { onMount } from 'svelte';
	import IconButton from '../IconButton.svelte';
	import Tooltip from '../Tooltip.svelte';
	import { persisted } from '../persisted-state.svelte.js';
	import GitHubIcon from './svg-icons/GitHubIcon.svelte';

	type Theme = 'light' | 'dark';
	const theme = persisted<Theme | null>('dark-mode', null);

	let prefersDarkMode = $state<boolean>();
	let isDarkModeEnabled = $derived(theme.value ? theme.value === 'dark' : prefersDarkMode);

	function onMediaQueryChange({ matches }: MediaQueryListEvent) {
		prefersDarkMode = matches;
	}

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', onMediaQueryChange);

		prefersDarkMode = mediaQuery.matches;

		return () => {
			mediaQuery.removeEventListener('change', onMediaQueryChange);
		};
	});
</script>

<header data-theme={theme.value ?? undefined}>
	<a class="logo" href={resolve('/')}>
		<SendToBackIcon />
		Svelte Tether
	</a>

	<div class="expand"></div>

	<!-- Render client-side only -->
	{#if isDarkModeEnabled !== undefined}
		<IconButton
			icon={isDarkModeEnabled ? SunIcon : MoonIcon}
			tooltipAlignment="bottom-center"
			onclick={() => (theme.value = isDarkModeEnabled ? 'light' : 'dark')}
		>
			{isDarkModeEnabled ? 'Use light mode' : 'Use dark mode'}
		</IconButton>
	{/if}

	<div class="divider"></div>

	<Tooltip alignment="bottom-center">
		<a href="https://github.com/doodlezucc/svelte-tether"><GitHubIcon /></a>

		{#snippet title()}
			GitHub
		{/snippet}
	</Tooltip>
</header>

<style lang="scss">
	@use '$docs/style/scheme';

	header {
		padding: 24px 48px;

		display: flex;
		align-items: center;
		gap: 32px;

		background-color: scheme.color('background');
		border-bottom: 1px solid scheme.color('separator');
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	a {
		color: scheme.color('text');
		display: inline-flex;
	}

	.expand {
		flex: 1;
	}

	.divider {
		background-color: scheme.color('separator');
		width: 1px;
		height: 100%;
	}
</style>
