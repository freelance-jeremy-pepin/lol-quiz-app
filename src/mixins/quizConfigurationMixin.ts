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
                    const itemsToFind: ItemLolApi[] = [];
                    const quizAnswers: QuizAnswer[] = [];

                    // Construit la liste des objets à deviner.
                    let itemsToPick: ItemLolApi[] = [...ItemLolApiStore.itemsFilteredForQuiz];
                    while (itemsToFind.length < quizConfigurationItem.numberQuestions) {
                        const quizAnswer = createDefaultQuizAnswer();

                        if (itemsToPick.length < 1) {
                            itemsToPick = [...ItemLolApiStore.itemsFilteredForQuiz];
                        }

                        const randomIndex = randomNumber(0, itemsToPick.length - 1);
                        const itemToFind = itemsToPick[randomIndex];
                        let itemIsValid: boolean = true;

                        switch (quizConfiguration.quiz.internalName) {
                            case QuizListInternalName.ItemName:
                                quizAnswer.value = itemToFind.name;
                                break;

                            case QuizListInternalName.ItemPrice:
                                if (!itemToFind.gold || !itemToFind.gold.total || itemToFind.gold.total < 1) {
                                    itemIsValid = false;
                                    break;
                                }

                                quizAnswer.value = itemToFind.gold.total.toString();
                                break;

                            default:
                        }

                        if (itemIsValid) {
                            itemsToFind.push(itemToFind);
                            quizAnswers.push(quizAnswer);
                        }

                        itemsToPick.splice(randomIndex, 1);
                    }

                    quizConfigurationItem.answers = quizAnswers;
                    quizConfigurationItem.items = itemsToFind;
                }

                return quizConfigurationItem;
            }

            case QuizListInternalName.ChampionSplashArt: {
                const quizConfigurationChampion: QuizConfigurationChampion = {
                    ...quizConfiguration,
                    champions: [],
                };

                quizConfigurationChampion.totalScore = findChampionWithSplashArtScoreCalculation[0].score * quizConfigurationChampion.numberQuestions;

                if (ChampionLolApiStore.champions) {
                    const championsToFind: ChampionLolApi[] = [];
                    const quizAnswers: QuizAnswer[] = [];

                    // Construit la liste des champions à deviner.
                    let championsToPick: ChampionLolApi[] = [...ChampionLolApiStore.champions];
                    while (championsToFind.length < quizConfigurationChampion.numberQuestions) {
                        const quizAnswer = createDefaultQuizAnswer();

                        if (championsToPick.length < 1) {
                            championsToPick = [...ChampionLolApiStore.champions];
                        }

                        const randomIndex = randomNumber(0, championsToPick.length - 1);
                        const championToFind = championsToPick[randomIndex];

                        quizAnswer.value = championToFind.name;

                        championsToFind.push(championToFind);
                        quizAnswers.push(quizAnswer);

                        championsToPick.splice(randomIndex, 1);
                    }

                    quizConfigurationChampion.answers = quizAnswers;
                    quizConfigurationChampion.champions = championsToFind;
                }

                return quizConfigurationChampion;
            }

            default:
                throw new Error(`Quiz ${quizConfiguration.quiz.name} : specialisation not yet implemented.`);
        }
    }
}
