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
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import { shuffleArray } from 'src/utils/array';

@Component({
    filters: {
        formatWithStopWatch(value: boolean): string {
            return value ? `With stop watch` : `Without stop watch`;
        },
    },
})
export default class QuizConfigurationMixin extends Mixins(SocketMixin) {
    public specialiseQuizConfiguration(quizConfiguration: QuizConfiguration): QuizConfigurationItem | QuizConfigurationChampion {
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

                    championsPicked.forEach(c => {
                        const quizAnswer = createDefaultQuizAnswer();
                        quizAnswer.value = c.name;
                        quizAnswers.push(quizAnswer);
                    });

                    quizConfigurationChampion.answers = quizAnswers;
                    quizConfigurationChampion.champions = championsPicked;
                }

                return quizConfigurationChampion;
            }

            default:
                throw new Error(`Quiz ${quizConfiguration.quiz.name} : specialisation not yet implemented.`);
        }
    }

    private pickRandoms(elements: ItemLolApi[] | ChampionLolApi[], numberElementToPick: number): ItemLolApi[] | ChampionLolApi[] {
        // Mélanges la liste des éléments.
        let elementsShuffled = shuffleArray(elements, randomNumber(1, 5));
        const elementsPicked: ChampionLolApi[] = [];

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
