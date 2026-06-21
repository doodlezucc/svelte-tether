import { mount, unmount, untrack, type Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { useAnimationFrameConditional } from '../util/animation-frame.svelte.ts';
import { createElementSizeMeasurer } from '../util/measure-element-size.ts';
import type { CommonTetherOptions, TetherState } from './common-types.ts';
import PositionedPortal from './PositionedPortal.svelte';
import { computeTetherLayout } from './tether-layout.ts';
import { useTetherBoundary } from './TetherBoundary.svelte';

export type TetherAttachmentOptions = CommonTetherOptions;

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
		wrapVertical = false,
		measureAnchor = true
	}: TetherAttachmentOptions
): Attachment<Element> {
	return (element) => {
		const tetherBoundary = useTetherBoundary();
		const initialBoundary = untrack(() => tetherBoundary?.getRect());

		let portalWidth = $state(0);
		let portalHeight = $state(0);

		const elementSizeMeasurer = createElementSizeMeasurer(element);

		let anchor = $state<DOMRect>(elementSizeMeasurer.measureRect());
		let boundary = $state<DOMRect | undefined>(initialBoundary);

		useAnimationFrameConditional(
			() => measureAnchor,
			() => {
				anchor = elementSizeMeasurer.measureRect();

				const overlayRect = tetherBoundary?.getRect();
				if (overlayRect) {
					boundary = overlayRect;
				}
			}
		);

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
