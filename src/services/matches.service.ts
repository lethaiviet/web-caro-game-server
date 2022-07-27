import { Action } from '@/interfaces/action.interface';
import { GameRoom, GameRoomType, Player, Position } from '@/interfaces/game-rooms.interface';
import { Match } from '@/interfaces/matches.interface';
import matcherModel from '@/models/matches.models';
import { diffWithCurrentTimeInSeconds } from '@/utils/util';
import _ from 'lodash';
import ActionsService from './actions.service';

class MatchesService {
  public matches = matcherModel;
  private actionsService = new ActionsService();

  public async createMatch(gameRoom: GameRoom): Promise<Match> {
    const type: GameRoomType = 'PlayForFun';
    const { _id: name, players: playersData } = gameRoom;
    const players = playersData.map(player => player._id);

    const createMatchData: Match = await this.matches.create({ type, name, players, actions: [] });
    return createMatchData;
  }

  public async addActionToMatch({ roomId, player, position }: { roomId: string; player: Player; position: Position }): Promise<void> {
    const findMatch: Match = await this.matches.findOne({ name: roomId });
    if (!findMatch) throw Error(`Cannot found any match with name - ${roomId}`);

    const action: Action = await this.actionsService.createAction(player._id, player.symbol, position);
    await this.matches.findOneAndUpdate({ _id: findMatch._id }, { $addToSet: { actions: action._id } });
  }

  public async addWinnerToMatch({ roomId, playerId }): Promise<void> {
    const findMatch: Match = await this.matches.findOne({ name: roomId });
    if (!findMatch) throw Error(`Cannot found any match with name - ${roomId}`);

    const totalTime = diffWithCurrentTimeInSeconds(findMatch.created_at);
    await this.matches.findOneAndUpdate({ _id: findMatch._id }, { $set: { winner: playerId, totalTime } });
  }
}

export default MatchesService;
