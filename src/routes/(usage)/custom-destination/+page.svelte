<script lang="ts">
	import Button from '$docs/Button.svelte';
	import CodeBlock from '$docs/CodeBlock.svelte';
	import Figure from '$docs/layout/Figure.svelte';
	import Heading from '$docs/layout/Heading.svelte';
	import BoundDestination from './BoundDestination.svelte';

	let useDestinationB = $state(false);
</script>

<Heading title="Custom Destination" />

<p>
	Portals, by default, mount your snippet to the <code>PortalOverlay</code> component at the "top layer"
	of the document.
</p>

<p>
	But you can also configure the <code>destination</code> property on a <code>Portal</code> to point
	to <b>any other element</b>.
</p>

<p>
	For example, the following outlined rectangles are plain <code>div</code> elements.
</p>

<BoundDestination {useDestinationB} />

<Figure>
	<Button onclick={() => (useDestinationB = !useDestinationB)}>Switch Destination</Button>
</Figure>

<p>
	By clicking the button, a portal (containg just a text span) switches its mounting destination
	from one <code>div</code> to another.
</p>

<CodeBlock>
	{`./BoundDestination.svelte`}
</CodeBlock>
