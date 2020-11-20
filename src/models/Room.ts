import User, { createDefaultUser } from 'src/models/User';
import Participant from 'src/models/Participant';
import Model from 'src/models/Model';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import { uniqueID } from 'src/utils/randomNumber';

export default interface Room extends Model {
    name: string;
    quizConfiguration: QuizConfiguration;
    owner: User;
    participants: Participant[];
}

export function createDefaultRoom(): Room {
    return {
        id: uniqueID(),
        quizConfiguration: createDefaultQuizConfiguration(),
        name: '',
        owner: createDefaultUser(),
        participants: [],
    };
}
