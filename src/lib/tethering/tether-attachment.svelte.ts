import { mount, unmount, untrack, type Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { useAnimationFrame } from '../util/animation-frame.svelte.ts';
import { createElementSizeMeasurer } from '../util/measure-element-size.ts';
import PositionedPortal from './PositionedPortal.svelte';
import { computeTetherLayout, type Alignment, type TetherState } from './tether-layout.ts';
import { useTetherBoundary } from './TetherBoundary.svelte';

export type SizeInheritMode = boolean | 'constrain';

export interface TetherOptions {
	origin: Alignment;

	/**
	 * Defaults to the value of `origin`.
	 */
	direction?: Alignment;

	/**
	 * @default false
	 */
	inheritWidth?: SizeInheritMode;
	/**
	 * @default false
	 */
	inheritHeight?: SizeInheritMode;

	/**
	 * If enabled, the horizontal alignment of the portal will be mirrored when there's not enough space.
	 *
	 * @default false
	 */
	wrapHorizontal?: boolean;
	/**
	 * If enabled, the vertical alignment of the portal will be mirrored when there's not enough space.
	 *
	 * @default false
	 */
	wrapVertical?: boolean;
}

export function tether(
	portal: Snippet<[state: TetherState]>,
	{
		origin,
		direction = origin,
		inheritWidth = false,
		inheritHeight = false,
		wrapHorizontal = false,
		wrapVertical = false
	}: TetherOptions
): Attachment<Element> {
	return (element) => {
		const tetherBoundary = useTetherBoundary();
		const initialBoundary = untrack(() => tetherBoundary?.getRect());

		let portalWidth = $state(0);
		let portalHeight = $state(0);

		const elementSizeMeasurer = createElementSizeMeasurer(element);

		let anchor = $state<DOMRect>(elementSizeMeasurer.measureRect());
		let boundary = $state<DOMRect | undefined>(initialBoundary);

		useAnimationFrame(() => {
			anchor = elementSizeMeasurer.measureRect();

			const overlayRect = tetherBoundary?.getRect();
			if (overlayRect) {
				boundary = overlayRect;
			}
		});

		const layout = $derived(
			computeTetherLayout({
				origin,
				direction,
				wrapHorizontal,
				wrapVertical,
				portalWidth,
				portalHeight,
				anchor,
				boundary
			})
		);

		const mountedPortalComponent = mount(PositionedPortal, {
			target: document.body, // This is probably not used, but the "target" option is required.
			props: {
				inheritWidth,
				inheritHeight,
				get anchorWidth() {
					return anchor.width;
				},
				get anchorHeight() {
					return anchor.height;
				},
				get layout() {
					return layout;
				},
				snippet: portal,
				onPortalMeasured: (width, height) => {
					portalWidth = width;
					portalHeight = height;
				}
			}
		});

		return () => {
			elementSizeMeasurer.dispose();
			unmount(mountedPortalComponent);
		};
	};
}
