import ChampionLolApi, { ImageTypesChampionLolApi } from 'src/models/LolApi/ChampionLolApi';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';

export default interface QuizConfigurationChampion extends QuizConfiguration {
    champions: ChampionLolApi[];
    imageType?: ImageTypesChampionLolApi | string;
}

export function createDefaultQuizConfigurationChampion(): QuizConfigurationChampion {
    return {
        ...createDefaultQuizConfiguration(),
        champions: [],
    };
}
