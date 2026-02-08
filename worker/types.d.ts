// TTF font file imports (bundled as ArrayBuffer by wrangler Data rule)
declare module '*.ttf' {
  const data: ArrayBuffer
  export default data
}
