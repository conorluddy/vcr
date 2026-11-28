// === PUBLIC API ===

/** Joins the class names that are set, so a component's own class and a consumer's `className` combine. */
export function joinClassNames(...classNames: ReadonlyArray<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
