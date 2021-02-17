import ChampionLolApi, { ImageTypesChampionLolApi, SkinTypes } from 'src/models/LolApi/ChampionLolApi';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';

export default interface QuizConfigurationChampion extends QuizConfiguration {
    champions: ChampionLolApi[];
    skinsIndex?: number[];
    imageType?: ImageTypesChampionLolApi | string;
    skins?: SkinTypes | string;
}

// noinspection JSUnusedGlobalSymbols
export function createDefaultQuizConfigurationChampion(): QuizConfigurationChampion {
    return {
        ...createDefaultQuizConfiguration(),
        champions: [],
    };
}
