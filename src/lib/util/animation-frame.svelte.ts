import { untrack } from 'svelte';

type TickListener = () => void;

// eslint-disable-next-line svelte/prefer-svelte-reactivity
const listeners = new Set<TickListener>();

let animationFrameRequest: number | undefined = undefined;

function tick() {
	animationFrameRequest = requestAnimationFrame(tick);
	for (const callback of listeners) {
		callback();
	}
}

export function useAnimationFrame(onTick: TickListener) {
	useAnimationFrameConditional(() => true, onTick);
}

export function useAnimationFrameConditional(condition: () => boolean, onTick: TickListener) {
	$effect(() => {
		// Lazy initialization because requestAnimationFrame(...)
		// is only available on the browser/client-side.
		animationFrameRequest ??= requestAnimationFrame(tick);
	});

	$effect(() => {
		if (condition()) {
			return untrack(() => {
				onTick();
				listeners.add(onTick);

				animationFrameRequest ??= requestAnimationFrame(tick);

				return () => {
					listeners.delete(onTick);
				};
			});
		}
	});
}
