### Unreleased

- Fixed `tether(...)` attachment excessively re-running when parameters change.
- Replaced global long lived `requestAnimationFrame` loop with separately scheduled loops per tether.

### Preview 0.4.0 (2026-06-21)

- **Breaking!** - Raised the `svelte` peer dependency version to `^5.29.0`, which introduced [attachments](https://svelte.dev/docs/svelte/@attach).
- **Breaking!** - Removed the read-only `wrappedElement` property from the `<Tether>` and `<BaseTetherToolip>` component in favor of attachments.
- Added functionality to allow _multi-child tethering_. Previously, it was only required to have exactly one child element in a `<Tether>`.
- Added the _`tether(...)` attachment_, which can be used via `{@attach tether(...)}` on elements/components directly.
- Added the optional `measureAnchor` prop to `<Tether>`, which can be specified to conditionally enable/disable the non-trivial computation of the position and size of wrapped elements.
- Added the optional `measureAnchorWhile(...)` predicate prop to `<BaseTetherTooltip>`. By default, tooltips now only calculate layout while their anchor is focused or hovered.

### Preview 0.3.0 (2026-06-11)

- **Breaking!** - Removed the `<Destination>` component and the `IDestination` type. Portals with a custom destination must now be configured with an `Element` instead.
- **Breaking!** - Enabled `pointer-events: all` for elements mounted to the root overlay. (Previously, elements inherited `pointer-events: none` from the overlay.)
- **Breaking!** - Refactored the exported `MountedPortal` class into an interface.
- Fixed unmounting of portalled snippets in some cases (by using Svelte's `mount` and `unmount` functions instead of `@render` statements).
