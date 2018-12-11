import Mouse from '@app/interfaces/Mouse'

import Grid from '@app/domain/Grid'
import Map from '@app/domain/Map'

const mouse = new Mouse()

const grid = new Grid()
const map = new Map(grid)
map.draw()
