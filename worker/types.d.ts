// TTF font file imports (bundled as ArrayBuffer by wrangler)
declare module '*.ttf' {
  const data: ArrayBuffer
  export default data
}

// WASM binary imports
declare module '*.wasm' {
  const data: WebAssembly.Module
  export default data
}

// resvg-wasm internals
declare module '@resvg/resvg-wasm/index_bg.wasm' {
  const data: WebAssembly.Module
  export default data
}
