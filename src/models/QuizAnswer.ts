import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/number';

export default interface QuizAnswer extends Model {
    value: string,
}

export function createDefaultQuizAnswer(): QuizAnswer {
    return {
        id: uniqueID(),
        value: '',
    };
}
