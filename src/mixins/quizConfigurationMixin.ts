import { Component, Mixins } from 'vue-property-decorator';
import { findChampionWithSplashArtScoreCalculation, QuizListInternalName } from 'src/models/Quiz';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import { randomNumber } from 'src/utils/number';
import QuizConfiguration from 'src/models/QuizConfiguration';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import SocketMixin from 'src/mixins/socketMixin';
import QuizAnswer, { createDefaultQuizAnswer } from 'src/models/QuizAnswer';
import ChampionLolApiStore from 'src/store/modules/LolApi/ChampionLolApiStore';
import ChampionLolApi, { SkinTypes } from 'src/models/LolApi/ChampionLolApi';
import { shuffleArray } from 'src/utils/array';
import QuizConfigurationRune from 'src/models/QuizConfigurationRune';
import RuneLolApiStore from 'src/store/modules/LolApi/RuneLolApiStore';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import ChampionSkinLolApi from 'src/models/LolApi/ChampionSkinLolApi';

@Component({
    filters: {
        formatWithStopWatch(value: boolean): string {
            return value ? `With stop watch` : `Without stop watch`;
        },
    },
})
export default class QuizConfigurationMixin extends Mixins(SocketMixin) {
    public specialiseQuizConfiguration(quizConfiguration: QuizConfiguration): QuizConfigurationItem | QuizConfigurationChampion | QuizConfigurationRune {
        switch (quizConfiguration.quiz.internalName) {
            case QuizListInternalName.ItemName:
            case QuizListInternalName.ItemPrice: {
                const quizConfigurationItem: QuizConfigurationItem = {
                    ...quizConfiguration,
                    items: [],
                };

                if (ItemLolApiStore.items) {
                    const quizAnswers: QuizAnswer[] = [];

                    // Construit la liste des objets à deviner.
                    let itemsPicked: ItemLolApi[] = [];

                    switch (quizConfiguration.quiz.internalName) {
                        case QuizListInternalName.ItemName:
                            itemsPicked = this.pickRandoms(ItemLolApiStore.itemsFilteredForQuiz, quizConfigurationItem.numberQuestions) as ItemLolApi[];
                            break;

                        case QuizListInternalName.ItemPrice:
                            itemsPicked = this.pickRandoms(ItemLolApiStore.itemsWithPrice, quizConfigurationItem.numberQuestions) as ItemLolApi[];
                            break;

                        default:
                    }

                    itemsPicked.forEach((i) => {
                        const quizAnswer = createDefaultQuizAnswer();

                        switch (quizConfiguration.quiz.internalName) {
                            case QuizListInternalName.ItemName:
                                quizAnswer.value = i.name;
                                break;

                            case QuizListInternalName.ItemPrice:
                                if (i.gold?.total) {
                                    quizAnswer.value = i.gold.total.toString();
                                }
                                break;

                            default:
                        }

                        quizAnswers.push(quizAnswer);
                    });

                    quizConfigurationItem.answers = quizAnswers;
                    quizConfigurationItem.items = itemsPicked;
                }

                return quizConfigurationItem;
            }

            case QuizListInternalName.ChampionImage: {
                const quizConfigurationChampion: QuizConfigurationChampion = {
                    ...quizConfiguration,
                    champions: [],
                };

                quizConfigurationChampion.totalScore = findChampionWithSplashArtScoreCalculation[0].score * quizConfigurationChampion.numberQuestions;

                if (ChampionLolApiStore.champions) {
                    const quizAnswers: QuizAnswer[] = [];

                    // Construit la liste des champions à deviner.
                    const championsPicked = this.pickRandoms(ChampionLolApiStore.champions, quizConfigurationChampion.numberQuestions) as ChampionLolApi[];

                    if (quizConfigurationChampion.skins) {
                        quizConfigurationChampion.skinsIndex = [];
                    }

                    championsPicked.forEach((c, index) => {
                        let answerDescription: string | null = null;

                        if (quizConfigurationChampion.skins && c.skins && quizConfigurationChampion.skinsIndex) {
                            let skin: ChampionSkinLolApi | null;

                            switch (quizConfigurationChampion.skins) {
                                case SkinTypes.allWithoutDefault:
                                    skin = c.skins[randomNumber(1, c.skins.length - 1)];

                                    break;

                                case SkinTypes.all:
                                    skin = c.skins[randomNumber(0, c.skins.length - 1)];
                                    break;

                                default:
                                    skin = c.skins[0];
                            }

                            quizConfigurationChampion.skinsIndex[index] = skin.num;
                            answerDescription = skin.name;
                        }

                        const quizAnswer = createDefaultQuizAnswer();
                        quizAnswer.value = c.name;

                        if (answerDescription) {
                            quizAnswer.description = answerDescription;
                        }

                        quizAnswers.push(quizAnswer);
                    });

                    quizConfigurationChampion.answers = quizAnswers;
                    quizConfigurationChampion.champions = championsPicked;
                }

                return quizConfigurationChampion;
            }

            case QuizListInternalName.RuneName: {
                const quizConfigurationRune: QuizConfigurationRune = {
                    ...quizConfiguration,
                    runes: [],
                };

                if (RuneLolApiStore.runes) {
                    const quizAnswers: QuizAnswer[] = [];

                    // Construit la liste des runes à deviner.
                    const runesPicked: RuneLolApi[] = this.pickRandoms(RuneLolApiStore.runes, quizConfigurationRune.numberQuestions) as RuneLolApi[];

                    runesPicked.forEach((r) => {
                        const quizAnswer = createDefaultQuizAnswer();
                        quizAnswer.value = r.name;
                        quizAnswers.push(quizAnswer);
                    });

                    quizConfigurationRune.answers = quizAnswers;
                    quizConfigurationRune.runes = runesPicked;
                }

                return quizConfigurationRune;
            }

            default:
                throw new Error(`Quiz ${quizConfiguration.quiz.name} : specialisation not yet implemented.`);
        }
    }

    private pickRandoms(elements: ItemLolApi[] | ChampionLolApi[] | RuneLolApi[], numberElementToPick: number): ItemLolApi[] | ChampionLolApi[] | RuneLolApi[] {
        // Mélanges la liste des éléments.
        let elementsShuffled = shuffleArray(elements, randomNumber(1, 5));
        const elementsPicked: ItemLolApi[] | ChampionLolApi[] | RuneLolApi[] = [];

        while (elementsPicked.length < numberElementToPick) {
            // Si la liste des éléments est vide, la remplie avec la liste initiale.
            if (elementsShuffled.length < 1) {
                elementsShuffled = shuffleArray(elements, randomNumber(1, 5));
            }

            const randomIndex = randomNumber(0, elementsShuffled.length - 1);
            elementsPicked.push(elementsShuffled[randomIndex]);

            // Supprime l'élément choisi pour ne pas avoir de doublon.
            elementsShuffled.splice(randomIndex, 1);
        }

        return elementsPicked;
    }
}
