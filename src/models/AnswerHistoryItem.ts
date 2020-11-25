import ItemLolApi, { createDefaultLolApiItem } from 'src/models/LolApi/ItemLolApi';
import AnswerHistory, { createDefaultAnswerHistory } from 'src/models/AnswerHistory';

// TODO: peut être supprimé ! AnswerHistory ne doit contenir que les réponses et non les items. Les items sont contenus dans QuizConfigurationItem.
export default interface AnswerHistoryItem extends AnswerHistory {
    item: ItemLolApi;
}

export function createDefaultAnswerHistoryItem(): AnswerHistoryItem {
    return {
        ...createDefaultAnswerHistory(),
        item: createDefaultLolApiItem(),
    };
}
