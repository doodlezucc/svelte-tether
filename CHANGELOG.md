### Unreleased

- **Breaking!** - Removed the `<Destination>` component and the `IDestination` type. Portals with a custom destination must now be configured with an `Element` instead.
- **Breaking!** - Enabled `pointer-events: all` for elements mounted to the root overlay. (Previously, elements inherited `pointer-events: none` from the overlay.)
- **Breaking!** - Refactored the exported `MountedPortal` class into an interface.
- Fixed unmounting of portalled snippets in some cases (by using Svelte's `mount` and `unmount` functions).
