import ChampionLolApi, { ImageTypesChampionLolApi, SkinTypes } from 'src/models/LolApi/ChampionLolApi';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import ChampionSpellLolApi from 'src/models/LolApi/ChampionSpellLolApi';

export default interface QuizConfigurationChampion extends QuizConfiguration {
    champions: ChampionLolApi[];
    skinsIndex?: number[];
    spells?: ChampionSpellLolApi[]; // TODO: faire un QuizConfigurationChampionSpell
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
