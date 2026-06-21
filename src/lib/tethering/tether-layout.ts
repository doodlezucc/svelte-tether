export type Alignment = keyof typeof ALIGNMENT_MAPPING;

const TOP = 0;
const LEFT = 0;
const BOTTOM = 1;
const RIGHT = 1;
const CENTER = 0.5;

const ALIGNMENT_MAPPING = {
	'top-left': [LEFT, TOP],
	'top-center': [CENTER, TOP],
	'top-right': [RIGHT, TOP],
	'center-left': [LEFT, CENTER],
	center: [CENTER, CENTER],
	'center-right': [RIGHT, CENTER],
	'bottom-left': [LEFT, BOTTOM],
	'bottom-center': [CENTER, BOTTOM],
	'bottom-right': [RIGHT, BOTTOM]
} satisfies Record<string, [number, number]>;

export interface TetherState {
	isMirroredHorizontally: boolean;
	isMirroredVertically: boolean;
}

interface ComputeTetherLayoutOptions {
	origin: Alignment;
	direction: Alignment;

	wrapHorizontal: boolean;
	wrapVertical: boolean;

	anchor: DOMRect;
	boundary?: DOMRect;

	portalWidth: number;
	portalHeight: number;
}

export interface TetherLayout {
	portalX: number;
	portalY: number;
	state: TetherState;
}

export function computeTetherLayout(options: ComputeTetherLayoutOptions): TetherLayout {
	const {
		origin,
		direction = origin,
		wrapHorizontal = false,
		wrapVertical = false,
		anchor,
		boundary,
		portalWidth,
		portalHeight
	} = options;

	const minX = !boundary ? Number.NEGATIVE_INFINITY : boundary.left;
	const minY = !boundary ? Number.NEGATIVE_INFINITY : boundary.top;
	const maxX = !boundary ? Number.POSITIVE_INFINITY : boundary.right - portalWidth;
	const maxY = !boundary ? Number.POSITIVE_INFINITY : boundary.bottom - portalHeight;

	const originHorizontal = ALIGNMENT_MAPPING[origin][0];
	const originVertical = ALIGNMENT_MAPPING[origin][1];

	const alignHorizontal = ALIGNMENT_MAPPING[direction][0];
	const alignVertical = ALIGNMENT_MAPPING[direction][1];

	const portalXUnclamped =
		anchor.x + originHorizontal * anchor.width - portalWidth * (1 - alignHorizontal);

	const portalYUnclamped =
		anchor.y + originVertical * anchor.height - portalHeight * (1 - alignVertical);

	const wrapLeftToRight = () => alignHorizontal === LEFT && portalXUnclamped - minX < 0;
	const wrapRightToLeft = () => alignHorizontal === RIGHT && maxX - portalXUnclamped < 0;
	const wrapTopToBottom = () => alignVertical === TOP && portalYUnclamped - minY < 0;
	const wrapBottomToTop = () => alignVertical === BOTTOM && maxY - portalYUnclamped < 0;

	const applyMirrorHorizontal = wrapHorizontal && (wrapLeftToRight() || wrapRightToLeft());
	const applyMirrorVertical = wrapVertical && (wrapBottomToTop() || wrapTopToBottom());

	const portalXWrappedUnclamped = !applyMirrorHorizontal
		? portalXUnclamped
		: anchor.x + (1 - originHorizontal) * anchor.width - portalWidth * alignHorizontal;

	const portalYWrappedUnclamped = !applyMirrorVertical
		? portalYUnclamped
		: anchor.y + (1 - originVertical) * anchor.height - portalHeight * alignVertical;

	let portalX = portalXWrappedUnclamped;
	let portalY = portalYWrappedUnclamped;

	if (boundary) {
		portalX = Math.min(Math.max(portalXWrappedUnclamped, minX), maxX);
		portalY = Math.min(Math.max(portalYWrappedUnclamped, minY), maxY);
	}

	return {
		portalX,
		portalY,
		state: {
			isMirroredHorizontally: applyMirrorHorizontal,
			isMirroredVertically: applyMirrorVertical
		}
	};
}
