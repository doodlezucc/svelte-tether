export interface ElementSizeMeasurer {
	measureRect(): DOMRect;
	dispose(): void;
}

class MultiChildSizeMeasurer implements ElementSizeMeasurer {
	private readonly root: Element;
	private readonly mutationObserver: MutationObserver;

	private isSubTreeOutdated = true;
	private elements: Element[] = [];

	constructor(root: Element) {
		this.root = root;
		this.mutationObserver = new MutationObserver(() => {
			this.isSubTreeOutdated = true;
		});

		this.mutationObserver.observe(root, { childList: true, subtree: true });
	}

	dispose() {
		this.mutationObserver.disconnect();
	}

	measureRect(): DOMRect {
		this.refreshWrappedElementsIfNeeded();

		if (this.elements.length === 0) {
			return new DOMRect();
		}

		let { left, top, right, bottom } = this.elements[0].getBoundingClientRect();

		for (let i = 1; i < this.elements.length; i++) {
			const rect = this.elements[i].getBoundingClientRect();

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

	private refreshWrappedElementsIfNeeded() {
		if (!this.isSubTreeOutdated) return;

		this.elements = this.findMeasurableDescendants();
		this.isSubTreeOutdated = false;
	}

	private findMeasurableDescendants(parent: Element = this.root): Element[] {
		const children = parent.children;
		const measurableDescendants: Element[] = [];

		for (const child of children) {
			if (MultiChildSizeMeasurer.isElementMeasurable(child)) {
				measurableDescendants.push(child);
			} else {
				measurableDescendants.push(...this.findMeasurableDescendants(child));
			}
		}

		return measurableDescendants;
	}

	private static isElementMeasurable(element: Element) {
		if (element.hasAttribute('data-tether')) return false;

		const cssStyle = getComputedStyle(element);
		if (cssStyle.display === 'none' || cssStyle.display === 'contents') {
			return false;
		}

		return true;
	}
}

export function createElementSizeMeasurer(root: HTMLElement) {
	return new MultiChildSizeMeasurer(root);
}
