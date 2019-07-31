enum MapKeys {
  Empty    = 0,
  BoxGray  = 1,
  BoxGreen = 2,
  BoxBlue  = 3,
}

export function isBox(mapKey: MapKeys) {
  return MapKeys[mapKey].startsWith('Box')
}

export default MapKeys
