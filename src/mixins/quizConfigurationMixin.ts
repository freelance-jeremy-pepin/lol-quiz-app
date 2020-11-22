import { Component, Mixins } from 'vue-property-decorator';
import { QuizListInternalName } from 'src/models/Quiz';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import { randomNumber } from 'src/utils/randomNumber';
import QuizConfiguration from 'src/models/QuizConfiguration';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import SocketMixin from 'src/mixins/socketMixin';

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
            case QuizListInternalName.ItemNameQuiz: {
                const quizConfigurationItem: QuizConfigurationItem = {
                    ...quizConfiguration,
                    items: [],
                };

                if (ItemLolApiStore.items) {
                    const itemsToFind: ItemLolApi[] = [];

                    // Construit la liste des objets à deviner.
                    let itemsToPick: ItemLolApi[] = [...ItemLolApiStore.items];
                    for (let i = 0; i < quizConfigurationItem.numberQuestions; i++) {
                        if (itemsToPick.length < 1) {
                            itemsToPick = [...ItemLolApiStore.items];
                        }

                        const randomIndex = randomNumber(0, itemsToPick.length - 1);
                        itemsToFind.push(itemsToPick[randomIndex]);
                        itemsToPick.splice(randomIndex, 1);
                    }

                    quizConfigurationItem.items = itemsToFind;
                }

                return quizConfigurationItem;
            }

            default:
                throw new Error(`Quiz ${quizConfiguration.quiz.name} : specialisation not yet implemented.`);
        }
    }
}
