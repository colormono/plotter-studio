import { PlotterDocument, Layer } from '../../types'
import { gridModule } from './grid'
import { ticTacToeModule } from './tictactoe'
import { testSheetModule } from './test-sheet'
import { loadedSvgModule } from './loaded-svg'
import { chainModule } from './chain'

export { gridModule } from './grid'
export { ticTacToeModule } from './tictactoe'
export { testSheetModule } from './test-sheet'
export { loadedSvgModule } from './loaded-svg'
export { chainModule } from './chain'

export const MODULES: Record<
  string,
  { render: (doc: PlotterDocument, layer: Layer) => SVGElement[] }
> = {
  grid: gridModule,
  tictactoe: ticTacToeModule,
  'test-sheet': testSheetModule,
  'loaded-svg': loadedSvgModule,
  chain: chainModule,
}
