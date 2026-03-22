# Steel Tooling Calculator - Improvement Roadmap

## 1. Data Integrity & Validation (High Impact)
- [x] **Integrate Zod for Input Validation**: Replace manual `parseFloat` and `if/else` checks in `validator.ts` with declarative schemas.
- [ ] **Unified Error Handling**: Map Zod validation errors to user-friendly UI messages automatically.
- [x] **Strict Unit Branding**: Prevent "Inches vs Units" bugs by using TypeScript `Branded` types for physical measurements.

## 2. Testing & Verification (Maintainability)
- [ ] **Property-Based Testing**: Use `fast-check` to verify that the `solver` and `optimizer` hold up under thousands of random width/tolerance combinations.
- [ ] **Integration Test for Machine Profiles**: Ensure adding a new machine profile (e.g., Slitter 5) doesn't break existing logic.
- [ ] **UI Snapshot Testing**: Prevent layout regressions in the "Setup Sheet" view.

## 3. UI/UX Modernization (Professionalism)
- [ ] **Component Library Integration**: Transition to `shadcn/ui` or a similar Radix-based library for pro-grade interactive elements.
- [ ] **Interactive Visualizations**: Add a canvas-based preview of the arbor layout to help operators visualize the setup before physically building it.
- [ ] **Offline Support (PWA)**: Ensure the calculator works in parts of the plant with poor Wi-Fi.

## 4. Architectural Patterns
- [ ] **Command/Action Pattern**: Move UI state management from `useFullSetup.ts` into a dedicated state machine or reducer-based action system for easier debugging.
- [ ] **Plugin System for Machines**: Make machine-specific "Clearance Strategies" more pluggable to support vastly different machine types in the future.
