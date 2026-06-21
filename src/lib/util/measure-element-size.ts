import {
	createSparseTreeObserver,
	TreeElementKind,
	type SparseTreeObserver
} from './sparse-tree-observer/sparse-tree-observer.ts';

export interface ElementSizeMeasurer {
	measureRect(): DOMRect;
	dispose(): void;
}

class MultiChildSizeMeasurer implements ElementSizeMeasurer {
	private readonly observer: SparseTreeObserver;

	constructor(root: Element) {
		this.observer = createSparseTreeObserver({
			root: root,
			filterElement: MultiChildSizeMeasurer.getElementMeasurability
		});
	}

	dispose() {
		this.observer.dispose();
	}

	measureRect(): DOMRect {
		const elements = [...this.observer.leafs];

		if (elements.length === 0) {
			return new DOMRect();
		}

		let { left, top, right, bottom } = elements[0].getBoundingClientRect();

		for (let i = 1; i < elements.length; i++) {
			const rect = elements[i].getBoundingClientRect();

			if (rect.left < left) {
				left = rect.left;
			}
			if (rect.right > right) {
				right = rect.right;
			}
			if (rect.top < top) {
				top = rect.top;
			}
			if (rect.bottom > bottom) {
				bottom = rect.bottom;
			}
		}

		return new DOMRect(left, top, right - left, bottom - top);
	}

	private static getElementMeasurability(element: Element): TreeElementKind {
		if (element.hasAttribute('data-tether')) {
			return TreeElementKind.deferToChildren;
		}

		const cssStyle = getComputedStyle(element);
		if (cssStyle.display === 'none') {
			return TreeElementKind.deadLeaf;
		}

		if (cssStyle.display === 'contents') {
			return TreeElementKind.deferToChildren;
		}

		return TreeElementKind.leaf;
	}
}

export function createElementSizeMeasurer(root: Element) {
	return new MultiChildSizeMeasurer(root);
}
