import { Action } from '@/interfaces/action.interface';
import { Position, Symbol } from '@/interfaces/game-rooms.interface';
import actionModel from '@/models/actions.models';

class ActionsService {
  public actions = actionModel;

  public async createAction(playerId: string, symbol: Symbol, position: Position): Promise<Action> {
    const createAction: Action = await this.actions.create({ playerId, symbol, position });
    return createAction;
  }
}

export default ActionsService;
