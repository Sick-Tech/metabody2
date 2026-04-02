// Type declarations for static assets imported by TypeScript
declare module '*.scss' {
  const content: Record<string, string>
  export default content
}
declare module '*.css' {
  const content: Record<string, string>
  export default content
}
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}
