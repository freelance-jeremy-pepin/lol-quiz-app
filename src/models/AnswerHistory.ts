import ItemLolApi, { createDefaultLolApiItem } from 'src/models/LolApi/ItemLolApi';
import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/randomNumber';

export default interface AnswerHistory extends Model {
    item: ItemLolApi;
    found: boolean;
    isAnswering: boolean;
    skipped: boolean;
    answers: { id: number, answer: string, isRight: boolean }[];
}

export function createDefaultAnswerHistory(): AnswerHistory {
    return {
        id: uniqueID(),
        item: createDefaultLolApiItem(),
        found: false,
        isAnswering: false,
        skipped: false,
        answers: [],
    };
}
