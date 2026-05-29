import { PlotterDocument, Layer } from '../../types'
import { gridModule } from './grid'
import { ticTacToeModule } from './tictactoe'

export { gridModule } from './grid'
export { ticTacToeModule } from './tictactoe'

export const MODULES: Record<
  string,
  { render: (doc: PlotterDocument, layer: Layer) => SVGElement[] }
> = {
  grid: gridModule,
  tictactoe: ticTacToeModule,
}
