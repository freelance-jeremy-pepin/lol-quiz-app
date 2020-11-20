import AnswerHistory from 'src/models/AnswerHistory';
import User, { createDefaultUser } from 'src/models/User';
import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/randomNumber';

export default interface Participant extends Model {
    user: User;
    currentQuestionNumber: number;
    hasFinished: boolean;
    answerHistory: AnswerHistory[];
}

export function createDefaultParticipant(): Participant {
    return {
        id: uniqueID(),
        user: createDefaultUser(),
        currentQuestionNumber: 0,
        hasFinished: false,
        answerHistory: [],
    };
}
