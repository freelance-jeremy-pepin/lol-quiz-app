import { Item } from 'src/models/item';

export interface AnswerHistory {
    id: number;
    item: Item;
    found: boolean;
    isAnswering: boolean;
    skipped: boolean;
    answers: { id: number, answer: string, isRight: boolean }[]
}
