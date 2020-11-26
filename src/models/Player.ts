import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/number';
import { createDefaultTime, Time } from 'src/models/Time';
import PlayerAnswerHistory from 'src/models/PlayerAnswerHistory';

export default interface Player extends Model {
    userId: string;
    score: number;
    currentQuestionNumber: number;
    hasFinished: boolean;
    answersHistory: PlayerAnswerHistory[];
    completeTime: Time;
    isReady: boolean;
}

export function createDefaultPlayer(): Player {
    return {
        id: uniqueID(),
        userId: '',
        score: 0,
        currentQuestionNumber: 0,
        hasFinished: false,
        answersHistory: [],
        completeTime: createDefaultTime(),
        isReady: false,
    };
}
