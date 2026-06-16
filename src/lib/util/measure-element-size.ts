export interface ElementSizeMeasurer {
	measureRect(): DOMRect;
	dispose(): void;
}

export class SingleElementSizeMeasurer implements ElementSizeMeasurer {
	private readonly root: HTMLElement;
	private readonly mutationObserver: MutationObserver;

	private isSubTreeOutdated = true;
	private wrappedElement!: HTMLElement;

	constructor(root: HTMLElement) {
		this.root = root;
		this.mutationObserver = new MutationObserver(() => {
			this.isSubTreeOutdated = true;
		});

		this.mutationObserver.observe(root, { childList: true, subtree: true });
		this.refreshWrappedElementIfNeeded();
	}

	dispose() {
		this.mutationObserver.disconnect();
	}

	measureRect(): DOMRect {
		this.refreshWrappedElementIfNeeded();

		return this.wrappedElement.getBoundingClientRect();
	}

	private refreshWrappedElementIfNeeded() {
		if (!this.isSubTreeOutdated) return;

		this.wrappedElement = this.findMeasurableDescendant();
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
