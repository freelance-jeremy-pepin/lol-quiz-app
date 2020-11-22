<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center" style="max-width: 300px; width: 100%;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-model="answer"
                :quiz-configuration="quizConfigurationItem"
                v-on:skip="onSkipItem"
                v-on:verify-answer="onVerifyAnswer"
                v-on:toggle-history="answerHistoryIsVisible =! answerHistoryIsVisible"
                v-on:play-again="onStartNewQuiz"
                v-on:view-history="answerHistoryIsVisible = true"
            >
                <template v-slot:image>
                    <icon-item
                        v-if="itemToGuess"
                        :item="itemToGuess"
                        :with-tooltip="!quizStageStore.isAnswering"
                    ></icon-item>
                </template>
            </icon-and-input-quiz-layout>

            <list-answers-history-item
                v-model="answerHistoryIsVisible"
                :answers-history-item="participant.answersHistoryItem"
            ></list-answers-history-item>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import { copyToClipboard } from 'quasar';
import { randomNumber, uniqueID } from 'src/utils/randomNumber';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconItem from 'components/Item/IconItem.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import Participant from 'src/models/Participant';
import ListAnswersHistoryItem from 'components/AnswerHistoryItem/ListAnswersHistoryItem.vue';
import QuizConfigurationItem, { createDefaultQuizConfigurationItem } from 'src/models/QuizConfigurationItem';
import QuizStore from 'src/store/modules/QuizStore';
import AnswerHistoryItem from 'src/models/AnswerHistoryItem';

@Component({
    components: {
        ListAnswersHistoryItem,
        IconAndInputQuizLayout,
        IconItem,
        ResultQuiz,
    },
})
export default class ItemNameQuizPage extends Vue {
    // region Computed properties

    /**
     * Récupère la liste de tous les objets du jeu.
     * Les objets tels que les consommables et nécessitant un champion sont exclus.
     * @private
     */
    private get items(): ItemLolApi[] | undefined {
        return ItemLolApiStore.itemsFilteredForQuiz;
    }

    /**
     * Récupère le participant du quiz.
     * @private
     */
    private get participant(): Participant {
        return QuizStore.participant;
    }

    /**
     * Modifier le participant du quiz.
     * @private
     */
    private set participant(participant: Participant) {
        QuizStore.setParticipant(participant);
    }

    /**
     * Store détenant l'état du quiz.
     */
    public get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
    }

    // endregion

    // region Data

    /**
     * Configuration du quiz.
     * @private
     */
    private quizConfigurationItem: QuizConfigurationItem = createDefaultQuizConfigurationItem();

    /**
     * Objet à deviner par le participant.
     * @private
     */
    private itemToGuess: ItemLolApi | null = null;

    /**
     * Liste des objets à trouver par le participant.
     * @private
     */
    private itemsToFind: ItemLolApi[] | null = null;

    /**
     * Réponse donnée par le participant.
     * @private
     */
    private answer: string = '';

    /**
     * Affiche l'historique des réponses.
     * @private
     */
    private answerHistoryIsVisible: boolean = false;

    /**
     * Références des composants enfants.
     */
    public $refs!: {
        quiz: HTMLFormElement;
    };

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols

    // noinspection JSUnusedLocalSymbols
    /**
     * Une fois le quiz monté, initialise le quiz.
     * @private
     */
    private mounted() {
        QuizStageStore.setLoading();

        this.initQuizConfigurationItem();
    }

    // endregion

    // region Event handlers

    /**
     * Démarre un nouveau quiz.
     * @private
     */
    private onStartNewQuiz() {
        this.startNewQuiz();
    }

    /**
     * Vérifie la réponse donnée par l'utilisateur.
     * @private
     */
    private onVerifyAnswer() {
        QuizStageStore.setVerifyingAnswer();

        // Si la réponse est correcte, incrémente le score et passe au prochain objet.
        // Sinon, passe en mode mauvaise réponse pendant 1 sec avant de revenir en mode quiz.
        if (this.verifyAnswer()) {
            this.participant = { ...this.participant, score: this.participant.score + 1 };

            this.onPickNextItem();
        } else {
            QuizStageStore.setWrong();

            setTimeout(() => {
                if (QuizStageStore.isWrong) {
                    QuizStageStore.setAnswering();
                }
            }, 1000);
        }
    }

    /**
     * Sélectionne le prochain objet.
     * @private
     */
    private onPickNextItem() {
        this.pickNextItem();

        this.answer = '';

        if (this.$refs.quiz) {
            this.$refs.quiz.focusAnswerInput();
        }
    }

    /**
     * Passe au prochain objet.
     * @private
     */
    private onSkipItem() {
        this.skipItem();
    }

    // endregion

    // region Methods

    /**
     * Démarre un nouveau quiz.
     * @private
     */
    private startNewQuiz() {
        this.resetQuiz();

        this.onPickNextItem();

        QuizStageStore.setAnswering();
    }

    /**
     * Initialise la configuration du quiz.
     * @private
     */
    private initQuizConfigurationItem() {
        this.quizConfigurationItem = createDefaultQuizConfigurationItem();

        this.quizConfigurationItem = {
            ...this.quizConfigurationItem,
            numberQuestions: this.$route.query.numberQuestions ? parseInt(this.$route.query.numberQuestions.toString(), 10) : 5,
            withStopWatch: this.$route.query.withStopWatch ? this.$route.query.withStopWatch.toString() === 'true' : false,
        };
    }

    /**
     * Vérifie la réponse donnée par le participant.
     * @private
     */
    private verifyAnswer(): boolean {
        if (this.itemToGuess?.name) {
            // Garde seulement les caractère alphanumérique du nom de l'objet et de la réponse donnée par le participant.
            // Si les 2 valeurs sont identiques, le participant a donné la bonne réponse.
            const itemName = this.itemToGuess.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const answer = this.answer.replace(/[^a-z0-9]/gi, '').toLowerCase();

            const answerIsRight = itemName === answer;

            this.updateLastAnswer(answerIsRight, false);

            return answerIsRight;
        }

        return false;
    }

    /**
     * Sélectionne le prochain objet.
     * @private
     */
    private pickNextItem() {
        // Si la question actuelle du participant dépasse le nombre total de questions du quiz,
        // cela veut dire qu'il a terminé le quiz.
        // Sinon, sélectionne le prochain objet.
        if (this.participant.currentQuestionNumber >= this.quizConfigurationItem.numberQuestions) {
            QuizStageStore.setQuizFinished();
            return;
        }

        this.participant = {
            ...this.participant,
            currentQuestionNumber: this.participant.currentQuestionNumber + 1,
        };

        if (this.itemsToFind) {
            this.itemToGuess = this.itemsToFind[this.participant.currentQuestionNumber - 1];
        }

        this.addEmptyAnswerToHistory();

        QuizStageStore.setAnswering();

        if (process.env.NODE_ENV === 'development' && this.itemToGuess?.name) {
            copyToClipboard(this.itemToGuess.name);

            // eslint-disable-next-line no-console
            console.log(`%c ${this.itemToGuess.name}`, 'color: #bada55', this.itemToGuess);
        }
    }

    /**
     * Passe au prochain objet.
     * @private
     */
    private skipItem() {
        this.updateLastAnswer(false, true);
        this.onPickNextItem();
    }

    /**
     * Ajoute une réponse vide à l'historique des réponses du participant.
     * @private
     */
    private addEmptyAnswerToHistory() {
        const lastAnswer = this.participant.answersHistoryItem[this.participant.answersHistoryItem.length - 1];

        if (lastAnswer) {
            lastAnswer.isAnswering = false;
        }

        if (this.itemToGuess) {
            const emptyAnswer: AnswerHistoryItem = {
                id: uniqueID(),
                item: this.itemToGuess,
                found: false,
                answers: [],
                isAnswering: true,
                skipped: false,
            };
            this.participant = {
                ...this.participant,
                answersHistoryItem: [
                    ...this.participant.answersHistoryItem,
                    emptyAnswer,
                ],
            };
            this.participant.answersHistoryItem.push();
        }
    }

    /**
     * Met à jour la dernière réponse donnée par le participant.
     * @param found L'objet a été trouvé.
     * @param skipped L'objet a été passé.
     * @private
     */
    private updateLastAnswer(found: boolean, skipped: boolean) {
        const lastAnswer = this.participant.answersHistoryItem[this.participant.answersHistoryItem.length - 1];
        lastAnswer.found = found;
        lastAnswer.skipped = skipped;

        if (skipped || found) {
            lastAnswer.isAnswering = false;
        }

        if (this.answer.trim()) {
            lastAnswer.answers = [...lastAnswer.answers, {
                id: new Date().getUTCMilliseconds(),
                isRight: found,
                answer: this.answer.trim(),
            }];
        }
    }

    /**
     * RaZ le quiz.
     * @private
     */
    private resetQuiz() {
        this.participant = {
            ...this.participant,
            currentQuestionNumber: 0,
            score: 0,
            answersHistoryItem: [],
        };

        this.itemsToFind = [];

        // Construit la liste des objets à deviner.
        if (this.items) {
            let itemsToPick: ItemLolApi[] = [...this.items];
            for (let i = 0; i < this.quizConfigurationItem.numberQuestions; i++) {
                if (itemsToPick.length < 1) {
                    itemsToPick = [...this.items];
                }

                const randomIndex = randomNumber(0, itemsToPick.length - 1);
                this.itemsToFind.push(itemsToPick[randomIndex]);
                itemsToPick.splice(randomIndex, 1);
            }
        }
    }

    /**
     * Démarre le premier quiz.
     * Le quiz depuis cette est lancé seulement si le quiz est en mode chargement
     * et que les objets ont été récupérés.
     */
    private firstStartNewQuiz() {
        if (QuizStageStore.isLoading && this.items) {
            this.startNewQuiz();
        }
    }

    // endregion

    // region Watchers

    /**
     * Lors du changement de la liste des objets, démarre le premier quiz.
     */
    @Watch('items', { immediate: true })
    public onItemsChanged() {
        this.firstStartNewQuiz();
    }

    /**
     * Lors du changement de l'état du quiz, démarre le premier quiz.
     */
    @Watch('quizStageStore.stage', { immediate: true })
    public onQuizStageChanged() {
        this.firstStartNewQuiz();
    }

    // endregion
}
</script>
