function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M16 16l4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function DocsToolbarSearch() {
  return (
    <details className="docs-toolbar-search-shell">
      <summary className="docs-toolbar-search-icon-button" aria-label="Toggle search input">
        <SearchIcon />
      </summary>
      <input
        className="docs-toolbar-search-input"
        aria-label="Search documentation"
        placeholder="Search documentation..."
      />
    </details>
  );
}
