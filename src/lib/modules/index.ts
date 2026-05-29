import { PlotterDocument, Layer } from '../../types'
import { gridModule } from './grid'
import { ticTacToeModule } from './tictactoe'
import { testSheetModule } from './test-sheet'

export { gridModule } from './grid'
export { ticTacToeModule } from './tictactoe'
export { testSheetModule } from './test-sheet'

export const MODULES: Record<
  string,
  { render: (doc: PlotterDocument, layer: Layer) => SVGElement[] }
> = {
  grid: gridModule,
  tictactoe: ticTacToeModule,
  'test-sheet': testSheetModule,
}
