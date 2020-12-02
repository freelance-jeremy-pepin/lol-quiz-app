import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';

export default interface QuizConfigurationRune extends QuizConfiguration {
    runes: RuneLolApi[];
}

export function createDefaultQuizConfigurationRune(): QuizConfigurationRune {
    return {
        ...createDefaultQuizConfiguration(),
        runes: [],
    };
}
