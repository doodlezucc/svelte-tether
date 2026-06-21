import { mount, unmount, untrack, type Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { useAnimationFrame } from '../util/animation-frame.svelte.ts';
import { createElementSizeMeasurer } from '../util/measure-element-size.ts';
import PositionedPortal from './PositionedPortal.svelte';
import { computeTetherLayout, type Alignment, type TetherState } from './tether-layout.ts';
import { useTetherBoundary } from './TetherBoundary.svelte';

export type SizeInheritMode = boolean | 'constrain';

export interface TetherOptions {
	/**
	 * The origin point of `portal`, anchored around the bounds of all wrapped elements.
	 *
	 * By default, the portal grows from this point outward. To further control the alignment
	 * of `portal` around the origin, use the `direction` option.
	 */
	origin: Alignment;

	/**
	 * The growing direction of `portal`, in relation to its anchored origin point.
	 *
	 * Defaults to the value of `origin`. That is, a `"top-left"` origin point also makes the `portal` grow
	 * further away from the "anchor" element into the top left direction.
	 */
	direction?: Alignment;

	/**
	 * Controls how to copy the width of the "anchor" element to the portal.
	 *
	 * * `false` - Portal width is unconstrained.
	 * * `true` - Portal width is always equal to the anchor's width (CSS `width` property).
	 * * `"constrain"` - Portal width is always equal to or less than the anchor's width (CSS `max-width` property).
	 *
	 * @default false
	 */
	inheritWidth?: SizeInheritMode;
	/**
	 * Controls how to copy the height of the "anchor" element to the portal.
	 *
	 * * `false` - Portal height is unconstrained.
	 * * `true` - Portal height is always equal to the anchor's height (CSS `height` property).
	 * * `"constrain"` - Portal height is always equal to or less than the anchor's height (CSS `max-height` property).
	 *
	 * @default false
	 */
	inheritHeight?: SizeInheritMode;

	/**
	 * If enabled, the horizontal alignment of the portal will be mirrored to the opposite
	 * side when there's not enough space (as bound by the closest `<TetherBoundary>`).
	 *
	 * @default false
	 */
	wrapHorizontal?: boolean;
	/**
	 * If enabled, the vertical alignment of the portal will be mirrored to the opposite
	 * side when there's not enough space (as bound by the closest `<TetherBoundary>`).
	 *
	 * @default false
	 */
	wrapVertical?: boolean;
}

/**
 * Returns an [attachment](https://svelte.dev/docs/svelte/@attach) which can be used on an element
 * or component to render a popover in relation to it.
 *
 * @example
 * ```svelte
 * <div {@attach tether(examplePopover, { origin: 'top-center' })}>
 *   Content
 * </div>
 *
 * {#snippet examplePopover()}
 *   <span>This is a popover!</span>
 * {/snippet}
 * ```
 */
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
