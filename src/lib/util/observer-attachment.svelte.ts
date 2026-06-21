import type { Attachment } from 'svelte/attachments';

interface MutationObserverAttachmentOptions<T extends EventTarget> {
	resolveRelative: (sourceElement: Element) => T | null;
	relativeAttachment: Attachment<T>;
	observerOptions: MutationObserverInit;
}

/**
 * Returns an attachment that watches mutations on the attached element using
 * the configuration from `observerOptions`.
 *
 * Whenever the result of `resolveRelative` changes, the `relativeAttachment` is
 * automatically added to the new relative and removed from the previous one.
 */
export function createMutationObserverAttachment<T extends EventTarget>(
	options: MutationObserverAttachmentOptions<T>
): Attachment<Element> {
	return (element) => {
		let relative = $state(options.resolveRelative(element));

		$effect(() => {
			if (relative !== null) {
				const detachFromRelativeElement = options.relativeAttachment(relative);

				return () => detachFromRelativeElement?.();
			}
		});

		const observer = new MutationObserver(() => {
			relative = options.resolveRelative(element);
		});

		observer.observe(element, options.observerOptions);

		return () => {
			observer.disconnect();
		};
	};
}
