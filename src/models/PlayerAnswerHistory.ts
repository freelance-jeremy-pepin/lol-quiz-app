import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/randomNumber';
import PlayerAnswer from 'src/models/PlayerAnswer';

export default interface PlayerAnswerHistory extends Model {
    found: boolean;
    skipped: boolean;
    answers: PlayerAnswer[];
}

export function createDefaultPlayerAnswerHistory(): PlayerAnswerHistory {
    return {
        id: uniqueID(),
        found: false,
        skipped: false,
        answers: [],
    };
}
