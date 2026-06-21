export enum TreeElementKind {
	/** Includes this element as a leaf and skips its subtree. */
	leaf,
	/** Excludes this element and its subtree. */
	deadLeaf,
	/** Continues the leaf search in this element's subtree. */
	deferToChildren
}

interface SparseTreeObserverConfiguration {
	root: Element;
	filterElement: (element: Element) => TreeElementKind;
}

export interface SparseTreeObserver {
	get leafs(): ReadonlySet<Element>;
	invalidate(): void;
	dispose(): void;
}

interface CachedTree {
	leafs: Set<Element>;
	deadLeafs: Set<Element>;
}

class SparseTreeObserverImpl implements SparseTreeObserver {
	private readonly observer: MutationObserver;
	private cachedTree: CachedTree | null = null;

	constructor(private readonly configuration: SparseTreeObserverConfiguration) {
		this.observer = new MutationObserver((records) => {
			if (!this.cachedTree) return;

			if (
				SparseTreeObserverImpl.doesMutationInvalidateTree(
					records,
					this.cachedTree,
					configuration.root
				)
			) {
				// The subtree is outdated and must be recomputed on the next access.
				this.invalidate();
			}
		});

		this.observer.observe(configuration.root, { childList: true, subtree: true });
	}

	get leafs(): ReadonlySet<Element> {
		if (!this.cachedTree) {
			this.cachedTree = { leafs: new Set(), deadLeafs: new Set() };
			this.collectDescendants(this.cachedTree);
		}

		return this.cachedTree.leafs;
	}

	invalidate() {
		this.cachedTree = null;
	}

	dispose() {
		this.observer.disconnect();
	}

	private static doesMutationInvalidateTree(
		records: MutationRecord[],
		tree: CachedTree,
		commonAncestor: Element
	): boolean {
		const allRemovedElements = new Set<Element>();

		for (const record of records) {
			for (const addedNode of record.addedNodes) {
				if (!(addedNode instanceof Element)) continue;

				const isNodePartOfAnyDeadLeaf = this.isDescendantOfAny(
					addedNode,
					tree.deadLeafs,
					commonAncestor
				);
				if (isNodePartOfAnyDeadLeaf) {
					// The addedNode is in the subtree of a dead leaf,
					// so it doesn't require invalidation.
					continue;
				}

				const isNodePartOfAnyLeaf = this.isDescendantOfAny(addedNode, tree.leafs, commonAncestor);
				if (!isNodePartOfAnyLeaf) {
					// The addedNode may become a new leaf.
					return true;
				}
			}

			for (const removedNode of record.removedNodes) {
				if (removedNode instanceof Element) {
					allRemovedElements.add(removedNode);
				}
			}
		}

		for (const leaf of tree.leafs) {
			if (allRemovedElements.has(leaf)) {
				// An entire leaf node was removed (or moved).
				return true;
			}

			if (this.isDescendantOfAny(leaf, allRemovedElements, commonAncestor)) {
				// The removedNode was the parent of a leaf.
				return true;
			}
		}

		return false;
	}

	private static isDescendantOfAny(
		element: Element,
		group: ReadonlySet<Element>,
		commonAncestor: Element
	) {
		if (group.size === 0) {
			return false;
		}

		let parent = element.parentElement;

		while (parent !== null && parent !== commonAncestor) {
			if (group.has(parent)) {
				return true;
			}

			parent = parent.parentElement;
		}

		return false;
	}

	private collectDescendants(
		collector: CachedTree,
		element: Element = this.configuration.root
	): void {
		const elementKind = this.configuration.filterElement(element);

		switch (elementKind) {
			case TreeElementKind.leaf:
				collector.leafs.add(element);
				break;

			case TreeElementKind.deadLeaf:
				collector.deadLeafs.add(element);
				break;

			case TreeElementKind.deferToChildren:
				for (const child of element.children) {
					this.collectDescendants(collector, child);
				}
				break;
		}
	}
}

export function createSparseTreeObserver(
	configuration: SparseTreeObserverConfiguration
): SparseTreeObserver {
	return new SparseTreeObserverImpl(configuration);
}
