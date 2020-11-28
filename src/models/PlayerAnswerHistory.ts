import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/number';
import PlayerAnswer from 'src/models/PlayerAnswer';
import { createDefaultTime, Time } from 'src/models/Time';

export default interface PlayerAnswerHistory extends Model {
    found: boolean;
    skipped: boolean;
    score: number;
    totalScore: number;
    startTime: Date;
    timeElapsed: Time;
    answers: PlayerAnswer[];
}

export function createDefaultPlayerAnswerHistory(): PlayerAnswerHistory {
    return {
        id: uniqueID(),
        found: false,
        skipped: false,
        score: 0,
        totalScore: 0,
        startTime: new Date(),
        timeElapsed: createDefaultTime(),
        answers: [],
    };
}
