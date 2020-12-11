import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import ChampionSpellLolApi from 'src/models/LolApi/ChampionSpellLolApi';

export default interface QuizConfigurationChampionSpell extends QuizConfiguration {
    spells: ChampionSpellLolApi[];
}

// noinspection JSUnusedGlobalSymbols
export function createDefaultQuizConfigurationChampionSpell(): QuizConfigurationChampionSpell {
    return {
        ...createDefaultQuizConfiguration(),
        spells: [],
    };
}
