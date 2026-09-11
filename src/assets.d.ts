declare module '*.png' {
  const dataUrl: string
  export default dataUrl
}

/** Markdown sources (the agent briefs) inlined into the browser bundle as text. */
declare module '*.md' {
  const text: string
  export default text
}
