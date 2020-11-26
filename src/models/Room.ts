import Player from 'src/models/Player';
import Model from 'src/models/Model';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import { uniqueID } from 'src/utils/number';

export default interface Room extends Model {
    name: string;
    quizConfiguration: QuizConfiguration;
    ownerId: string; // ID d'un User.
    players: Player[];
    inGame: boolean;
}

export function createDefaultRoom(): Room {
    return {
        id: uniqueID(),
        quizConfiguration: createDefaultQuizConfiguration(),
        name: '',
        ownerId: '',
        players: [],
        inGame: false,
    };
}
