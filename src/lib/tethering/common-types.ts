import type { Alignment } from './tether-layout.ts';

export type SizeInheritMode = boolean | 'constrain';

export interface CommonTetherOptions {
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

	/**
	 * Whether to enable the observation of changes to the anchor's size.
	 *
	 * If the rendered `portal` snippet is only visible sometimes, it's recommended to set this
	 * to `false` while the portal is invisible.
	 *
	 * Measuring the anchor's position and size is done with `getBoundingClientRect()` calls
	 * on every frame. If there are a lot of tethered components on the page at the same time,
	 * this process can have a bad performance impact. While `measureAnchor` is `false`,
	 * frame-by-frame computations are skipped for this tether.
	 *
	 * @default true
	 */
	measureAnchor?: boolean;
}

export interface TetherState {
	isMirroredHorizontally: boolean;
	isMirroredVertically: boolean;
}
