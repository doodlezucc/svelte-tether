export interface ElementSizeMeasurer {
	measureRect(): DOMRect;
	dispose(): void;
}

export class SingleElementSizeMeasurer implements ElementSizeMeasurer {
	private readonly root: HTMLElement;
	private readonly mutationObserver: MutationObserver;

	private isSubTreeOutdated = true;
	#wrappedElement!: HTMLElement;

	constructor(root: HTMLElement) {
		this.root = root;
		this.mutationObserver = new MutationObserver(() => {
			this.isSubTreeOutdated = true;
		});

		this.mutationObserver.observe(root, { childList: true, subtree: true });
		this.refreshWrappedElementIfNeeded();
	}

	// Only needed temporarily, because BaseTetherTooltip wants to apply attributes on the wrapped element
	get wrappedElement() {
		return this.#wrappedElement;
	}

	dispose() {
		this.mutationObserver.disconnect();
	}

	measureRect(): DOMRect {
		this.refreshWrappedElementIfNeeded();

		return this.#wrappedElement.getBoundingClientRect();
	}

	private refreshWrappedElementIfNeeded() {
		if (!this.isSubTreeOutdated) return;

		this.#wrappedElement = this.findMeasurableDescendant();
		this.isSubTreeOutdated = false;
	}

	private findMeasurableDescendant(parent: HTMLElement = this.root): HTMLElement {
		const children = parent.children;

		const htmlElementChildren = [...children].filter((element) => element instanceof HTMLElement);

		if (htmlElementChildren.length !== 1) {
			throw new Error('Tether must have exactly one child element');
		}

		const child = htmlElementChildren[0];
		if (child.hasAttribute('data-tether')) {
			return this.findMeasurableDescendant(child);
		} else {
			return child;
		}
	}
}

class MultiElementSizeMeasurer implements ElementSizeMeasurer {
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

		try {
			const singleValidElement = this.findMeasurableDescendant();

			this.elements = [singleValidElement];
			this.isSubTreeOutdated = false;
		} catch (err) {
			console.error(err);
			this.elements = [];
		}
	}

	private findMeasurableDescendant(parent: Element = this.root): Element {
		const children = parent.children;

		if (children.length !== 1) {
			throw new Error('Tether must have exactly one child element');
		}

		const child = children[0] as Element;
		if (child.hasAttribute('data-tether')) {
			return this.findMeasurableDescendant(child);
		} else {
			return child;
		}
	}
}

export function createElementSizeMeasurer(root: HTMLElement) {
	return new SingleElementSizeMeasurer(root);
}
