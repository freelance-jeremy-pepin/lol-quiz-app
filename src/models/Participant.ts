import AnswerHistory from 'src/models/AnswerHistory';
import User, { createDefaultUser } from 'src/models/User';
import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/randomNumber';
import { createDefaultTime, Time } from 'src/models/Time';

export default interface Participant extends Model {
    user: User;
    score: number;
    currentQuestionNumber: number;
    hasFinished: boolean;
    answersHistory: AnswerHistory[];
    completeTime: Time;
}

export function createDefaultParticipant(): Participant {
    return {
        id: uniqueID(),
        user: createDefaultUser(),
        score: 0,
        currentQuestionNumber: 0,
        hasFinished: false,
        answersHistory: [],
        completeTime: createDefaultTime(),
    };
}
