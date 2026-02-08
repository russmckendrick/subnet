import schibstedRegular from './fonts/SchibstedGrotesk-Regular.ttf'
import schibstedBold from './fonts/SchibstedGrotesk-Bold.ttf'
import martianMono from './fonts/MartianMono-Regular.ttf'

export interface FontData {
  name: string
  data: ArrayBuffer
  weight: number
  style: string
}

function toArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data
  return (data as Uint8Array).buffer as ArrayBuffer
}

export function getFonts(): FontData[] {
  return [
    {
      name: 'Schibsted Grotesk',
      data: toArrayBuffer(schibstedRegular),
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Schibsted Grotesk',
      data: toArrayBuffer(schibstedBold),
      weight: 700,
      style: 'normal',
    },
    {
      name: 'Martian Mono',
      data: toArrayBuffer(martianMono),
      weight: 400,
      style: 'normal',
    },
  ]
}
