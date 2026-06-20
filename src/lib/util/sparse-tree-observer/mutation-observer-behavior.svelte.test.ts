import { tick } from 'svelte';
import { afterEach, beforeEach, expect, test, vi, type Mock } from 'vitest';

// This test suite is just a sanity check to see how the MutationObserver works in a browser.
//
// Specifically, it asserts that:
// - a "childList" observation has no initial trigger event
// - adding/removing a single direct child triggers a single mutation with one record
// - adding/removing the observed element doesn't trigger a mutation
// - removing and then re-adding an observed element keeps the observer alive

let divElement!: HTMLDivElement;
let onMutated!: Mock<MutationCallback>;
let observer!: MutationObserver;

beforeEach(() => {
	divElement = document.createElement('div');
	document.body.append(divElement);

	onMutated = vi.fn<MutationCallback>();
	observer = new MutationObserver(onMutated);

	observer.observe(divElement, { childList: true });

	// Assert no "initial" event to be triggered
	expect(onMutated).not.toHaveBeenCalled();
});

afterEach(() => {
	observer.disconnect();
});

test('Add/remove single child', async () => {
	const childElement = document.createElement('p');

	// Add single child
	divElement.append(childElement);
	await tick();
	expect(onMutated).toHaveBeenCalledOnce();

	let mutations = onMutated.mock.lastCall![0];
	expect(mutations).toHaveLength(1);

	expect(mutations[0]).toEqual(
		expect.objectContaining<Partial<MutationRecord>>({ type: 'childList' })
	);
	expect(mutations[0].addedNodes).toHaveLength(1);
	expect(mutations[0].addedNodes.item(0)).toEqual(childElement);
	expect(mutations[0].removedNodes).toHaveLength(0);

	// Remove single child
	childElement.remove();
	await tick();
	expect(onMutated).toHaveBeenCalledTimes(2);

	mutations = onMutated.mock.lastCall![0];
	expect(mutations).toHaveLength(1);

	expect(mutations[0]).toEqual(
		expect.objectContaining<Partial<MutationRecord>>({ type: 'childList' })
	);
	expect(mutations[0].addedNodes).toHaveLength(0);
	expect(mutations[0].removedNodes).toHaveLength(1);
	expect(mutations[0].removedNodes.item(0)).toEqual(childElement);
});

test('Add/remove observed element itself', async () => {
	const previousParent = divElement.parentElement!;

	// Remove observed element from document
	divElement.remove();
	await tick();
	expect(onMutated).not.toHaveBeenCalled();

	// Re-add observed element to document
	previousParent.append(divElement);
	await tick();
	expect(onMutated).not.toHaveBeenCalled();

	// Add child to observed element
	const childElement = document.createElement('p');
	divElement.append(childElement);
	await tick();
	expect(onMutated).toHaveBeenCalledOnce();

	const mutations = onMutated.mock.lastCall![0];
	expect(mutations).toHaveLength(1);

	expect(mutations[0]).toEqual(
		expect.objectContaining<Partial<MutationRecord>>({ type: 'childList' })
	);
	expect(mutations[0].addedNodes).toHaveLength(1);
	expect(mutations[0].addedNodes.item(0)).toEqual(childElement);
	expect(mutations[0].removedNodes).toHaveLength(0);
});
