import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';

export default interface QuizConfigurationRune extends QuizConfiguration {
    runes: RuneLolApi[];
    questionType?: RuneQuestionType | string;
}

export function createDefaultQuizConfigurationRune(): QuizConfigurationRune {
    return {
        ...createDefaultQuizConfiguration(),
        runes: [],
    };
}

export enum RuneQuestionType {
    icon = 'icon',
    description = 'description',
}
