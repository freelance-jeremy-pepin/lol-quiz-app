import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/randomNumber';

export default interface AnswerHistory extends Model {
    found: boolean;
    isAnswering: boolean;
    skipped: boolean;
    answer: string; // TODO: Ne doit pas être dans AnswerHistory. La réponse se trouve dans QuizConfigurationItem
    answers: { id: number, answer: string, isRight: boolean }[];
}

export function createDefaultAnswerHistory(): AnswerHistory {
    return {
        id: uniqueID(),
        found: false,
        isAnswering: false,
        skipped: false,
        answer: '',
        answers: [],
    };
}
