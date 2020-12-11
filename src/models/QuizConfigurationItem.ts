import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';

export default interface QuizConfigurationItem extends QuizConfiguration {
    items: ItemLolApi[];
    questionType?: ItemQuestionType | string;
}

// noinspection JSUnusedGlobalSymbols
export function createDefaultQuizConfigurationItem(): QuizConfigurationItem {
    return {
        ...createDefaultQuizConfiguration(),
        items: [],
    };
}

export enum ItemQuestionType {
    icon = 'icon',
    description = 'description',
}
