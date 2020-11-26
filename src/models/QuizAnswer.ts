import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/randomNumber';

export default interface QuizAnswer extends Model {
    value: string,
}

export function createDefaultQuizAnswer(): QuizAnswer {
    return {
        id: uniqueID(),
        value: '',
    };
}
