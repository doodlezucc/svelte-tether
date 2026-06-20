import { tick } from 'svelte';
import { afterEach, beforeEach, expect, test } from 'vitest';
import {
	createSparseTreeObserver,
	TreeElementKind,
	type SparseTreeObserver
} from './sparse-tree-observer.ts';

let divElement!: HTMLDivElement;
let observer!: SparseTreeObserver;

beforeEach(() => {
	divElement = document.createElement('div');
	document.body.append(divElement);

	observer = createSparseTreeObserver({
		root: divElement,
		filterElement: (element) => {
			if (getComputedStyle(element).display === 'none') {
				return TreeElementKind.deadLeaf;
			}

			if (element.tagName === 'P') {
				return TreeElementKind.leaf;
			}

			return TreeElementKind.deferToChildren;
		}
	});

	// Assert initial event to be triggered
	expect(observer.leafs.size).toEqual(0);
});

afterEach(() => {
	observer.dispose();
});

test('Add/remove single leaf child', async () => {
	const childElement = document.createElement('p');

	// Add single child
	divElement.append(childElement);
	await tick();
	expect(observer.leafs).toEqual(new Set([childElement]));

	// Remove single child
	childElement.remove();
	await tick();
	expect(observer.leafs).toEqual(new Set([]));
});

test('Add/remove deferring child with leaf grandchild', async () => {
	const childElement = document.createElement('div');
	const grandchildElement = document.createElement('p');
	childElement.append(grandchildElement);

	// Add single child
	divElement.append(childElement);
	await tick();
	expect(observer.leafs).toEqual(new Set([grandchildElement]));

	// Remove single child
	childElement.remove();
	await tick();
	expect(observer.leafs).toEqual(new Set());
});

test('Add/remove dead leaf child with leaf grandchild', async () => {
	const childElement = document.createElement('div');
	childElement.style.display = 'none';

	const grandchildElement = document.createElement('p');
	childElement.append(grandchildElement);

	// Add single child
	divElement.append(childElement);
	await tick();
	expect(observer.leafs).toEqual(new Set());

	// Remove single child
	childElement.remove();
	await tick();
	expect(observer.leafs).toEqual(new Set());
});

test('No invalidation when adding/removing child of leaf', async () => {
	const childElement = document.createElement('p');
	divElement.append(childElement);

	await tick();
	const stableLeafsSet = observer.leafs;

	// Add grandchild
	const grandchildElement = document.createElement('span');
	childElement.append(grandchildElement);
	await tick();
	expect(observer.leafs).toBe(stableLeafsSet); // Assert no invalidation

	// Remove grandchild
	grandchildElement.remove();
	await tick();
	expect(observer.leafs).toBe(stableLeafsSet); // Assert no invalidation
});

test('No invalidation when adding/removing child of dead leaf', async () => {
	const childElement = document.createElement('p');
	childElement.style.display = 'none';
	divElement.append(childElement);

	await tick();
	const stableLeafsSet = observer.leafs;

	// Add grandchild
	const grandchildElement = document.createElement('span');
	childElement.append(grandchildElement);
	await tick();
	expect(observer.leafs).toBe(stableLeafsSet); // Assert no invalidation

	// Remove grandchild
	grandchildElement.remove();
	await tick();
	expect(observer.leafs).toBe(stableLeafsSet); // Assert no invalidation
});
