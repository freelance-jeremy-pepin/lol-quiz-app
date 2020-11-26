<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center" style="max-width: 350px; width: 100%;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-model="answerGivenByPlayer"
                :isMultiplayer="isMultiplayer"
                :quiz-configuration="quizConfigurationItem"
                v-on:skip="onSkipItem"
                v-on:correct-answer="onCorrectAnswer"
                v-on:toggle-history="onModalToggleAnswersHistory(null)"
                v-on:play-again="onStartNewQuiz"
                v-on:view-history="onModalToggleAnswersHistory"
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
                v-model="modalAnswersHistoryItem.display"
                :player="modalAnswersHistoryItem.player"
                :quiz-configuration-item="quizConfigurationItem"
            ></list-answers-history-item>

            <!--<table-answer-history-item-->
            <!--    v-if="isMultiplayer && room"-->
            <!--    v-model="modalAnswersHistoryItem.display"-->
            <!--    :players="room.players"-->
            <!--    :quiz-configuration-item="quizConfigurationItem"-->
            <!--&gt;</table-answer-history-item>-->
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import { copyToClipboard } from 'quasar';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconItem from 'components/Item/IconItem.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import Player, { createDefaultPlayer } from 'src/models/Player';
import ListAnswersHistoryItem from 'components/AnswerHistoryItem/ListAnswersHistoryItem.vue';
import QuizConfigurationItem, { createDefaultQuizConfigurationItem } from 'src/models/QuizConfigurationItem';
import QuizStore from 'src/store/modules/QuizStore';
import SocketMixin from 'src/mixins/socketMixin';
import UserMixin from 'src/mixins/userMixin';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';
import { quizList } from 'src/models/Quiz';
import Room from 'src/models/Room';
import TableAnswerHistoryItem from 'components/AnswerHistoryItem/TableAnswerHistoryItem.vue';
import { createDefaultPlayerAnswerHistory } from 'src/models/PlayerAnswerHistory';
import QuizAnswer from 'src/models/QuizAnswer';

@Component({
    components: {
        TableAnswerHistoryItem,
        ListAnswersHistoryItem,
        IconAndInputQuizLayout,
        IconItem,
        ResultQuiz,
    },
})
export default class ItemNameQuizPage extends Mixins(SocketMixin, UserMixin, QuizConfigurationMixin) {
    // region Data

    private isMultiplayer: boolean = false;

    /**
     * Données de la modale historique des réponses.
     */
    private modalAnswersHistoryItem: { display: boolean, player: Player } = {
        display: false,
        player: createDefaultPlayer(),
    };

    // endregion

    // region Computed properties

    /**
     * Récupère la liste de tous les objets du jeu.
     * Les objets tels que les consommables et nécessitant un champion sont exclus.
     * @private
     */
    private get items(): ItemLolApi[] {
        return ItemLolApiStore.itemsFilteredForQuiz;
    }

    /**
     * Récupère le joueur du quiz.
     * @private
     */
    private get player(): Player {
        return QuizStore.player;
    }

    /**
     * Modifier le joueur du quiz.
     * @private
     */
    private set player(player: Player) {
        QuizStore.setPlayer(player);
    }

    /**
     * Store détenant l'état du quiz.
     */
    public get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
    }

    private get room(): Room | undefined | null {
        return this.roomSocketStore.room;
    }

    private get currentQuizAnswer(): QuizAnswer {
        return this.quizConfigurationItem.answers[this.player.currentQuestionNumber - 1];
    }

    // endregion

    // region Data

    /**
     * Configuration du quiz.
     * @private
     */
    private quizConfigurationItem: QuizConfigurationItem = createDefaultQuizConfigurationItem();

    /**
     * Objet à deviner par le joueur.
     * @private
     */
    private itemToGuess: ItemLolApi | null = null;

    /**
     * Réponse donnée par le joueur.
     * @private
     */
    private answerGivenByPlayer: string = '';

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
     * Sélectionne le prochain objet.
     * @private
     */
    private onPickNextItem() {
        this.pickNextItem();

        this.answerGivenByPlayer = '';

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

    private onModalToggleAnswersHistory(player?: Player) {
        this.toggleModalAnswersHistory(player);
    }

    private onCorrectAnswer() {
        // Si la réponse est correcte, incrémente le score et passe au prochain objet.
        this.player = { ...this.player, score: this.player.score + 1 };

        this.onPickNextItem();
    }

    // endregion

    // region Methods

    /**
     * Démarre un nouveau quiz.
     * @private
     */
    private startNewQuiz() {
        this.resetQuiz();

        if (!this.isMultiplayer) {
            this.onPickNextItem();
        }

        QuizStageStore.setAnswering();
    }

    /**
     * Initialise la configuration du quiz.
     * @private
     */
    private initQuizConfigurationItem() {
        this.quizConfigurationItem = createDefaultQuizConfigurationItem();

        // Si la salle est renseignée, cela veut dire que le quiz est fait en multi joueur.
        // Sinon, le quiz est fait en solo.
        if (this.$route.query.room) {
            this.isMultiplayer = true;

            this.roomSocketStore.getRoomById({
                id: this.$route.query.room.toString(),
                user: this.me,
            });
        } else {
            const quiz = quizList.find(q => q.id === this.$route.query.quiz);

            if (!quiz) {
                throw new Error('Unknown quiz');
            }

            this.quizConfigurationItem = {
                ...this.quizConfigurationItem,
                quiz,
                numberQuestions: this.$route.query.numberQuestions ? parseInt(this.$route.query.numberQuestions.toString(), 10) : 5,
                withStopWatch: this.$route.query.withStopWatch ? this.$route.query.withStopWatch.toString() === 'true' : false,
            };
        }
    }

    /**
     * Sélectionne le prochain objet.
     * @private
     */
    private pickNextItem(addEmptyAnswerToHistory: boolean = true) {
        // Si la question actuelle du joueur dépasse le nombre total de questions du quiz,
        // cela veut dire qu'il a terminé le quiz.
        // Sinon, sélectionne le prochain objet.
        if (this.player.currentQuestionNumber >= this.quizConfigurationItem.numberQuestions) {
            QuizStageStore.setQuizFinished();

            if (this.isMultiplayer && this.room) {
                this.roomSocketStore.updatePlayer({
                    room: this.room,
                    player: { ...this.player, hasFinished: true },
                });
            }

            return;
        }

        this.player = {
            ...this.player,
            currentQuestionNumber: this.player.currentQuestionNumber + 1,
        };

        this.itemToGuess = this.quizConfigurationItem.items[this.player.currentQuestionNumber - 1];

        if (addEmptyAnswerToHistory) {
            this.addEmptyAnswerToHistory();
        }

        QuizStageStore.setAnswering();

        // Met à jour le joueur.
        if (this.isMultiplayer && this.room) {
            this.roomSocketStore.updatePlayer({
                room: this.room,
                player: this.player,
            });
        }

        if (process.env.NODE_ENV === 'development' && this.currentQuizAnswer) {
            copyToClipboard(this.currentQuizAnswer.value);

            // eslint-disable-next-line no-console
            console.log(`%c ${this.currentQuizAnswer.value}`, 'color: #bada55', this.itemToGuess);
        }
    }

    /**
     * Passe au prochain objet.
     * @private
     */
    private skipItem() {
        this.onPickNextItem();
    }

    /**
     * Ajoute une réponse vide à l'historique des réponses du joueur.
     * @private
     */
    private addEmptyAnswerToHistory() {
        if (this.itemToGuess) {
            const emptyAnswer = createDefaultPlayerAnswerHistory();
            this.player.answersHistory = [...this.player.answersHistory, emptyAnswer];
        }
    }

    /**
     * RaZ le quiz.
     * @private
     */
    private resetQuiz() {
        this.player = {
            ...this.player,
            currentQuestionNumber: 0,
            score: 0,
            answersHistory: [],
        };

        if (!this.isMultiplayer) {
            this.quizConfigurationItem = this.specialiseQuizConfiguration(this.quizConfigurationItem) as QuizConfigurationItem;
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

    /**
     * Affiche ou masque la modale de l'historique des réponses.
     */
    private toggleModalAnswersHistory(player?: Player) {
        if (!this.modalAnswersHistoryItem.display) {
            if (player) {
                this.modalAnswersHistoryItem.player = player;
            } else {
                this.modalAnswersHistoryItem.player = this.player;
            }
        }

        this.modalAnswersHistoryItem.display = !this.modalAnswersHistoryItem.display;
    }

    /**
     * Modifie la configuration du quiz à partir d'une salle.
     */
    private setQuizConfigurationItemFromRoom(room: Room) {
        this.quizConfigurationItem = room.quizConfiguration as QuizConfigurationItem;

        const playerFound = room.players.find(p => p.userId === this.me.id);

        if (playerFound) {
            this.player = playerFound;

            // TODO: à revoir
            // Si le joueur a déjà commencé le quiz, on le place sur l'objet précédent pour sélectionner le suivant.
            let addEmptyAnswerToHistory = true;
            if (this.player.currentQuestionNumber > 0 && !this.player.hasFinished) {
                this.player = {
                    ...this.player,
                    currentQuestionNumber: this.player.currentQuestionNumber - 1,
                };
                addEmptyAnswerToHistory = false;
            }

            this.pickNextItem(addEmptyAnswerToHistory);
        }
    }

    private refreshPlayerAnswerHistoryFromRoom(room: Room) {
        const playerFound = room.players.find(p => p.id === this.modalAnswersHistoryItem.player.id);

        if (playerFound) {
            this.modalAnswersHistoryItem.player = playerFound;
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

    /**
     * Dès que la salle a été récupérée, initialise le quiz.
     * Dès que la salle change et si l'historique des réponses est ouverte, met à jour l'historique.
     * @private
     */
    @Watch('room', { deep: true })
    public onRoomChanged() {
        if (this.isMultiplayer) {
            if (this.room) {
                // Initialise la configuration du quiz seulement si elle n'a pas déjà été initialisée.
                if (this.quizConfigurationItem.items.length < 1) {
                    this.setQuizConfigurationItemFromRoom(this.room);
                }

                if (this.modalAnswersHistoryItem.display) {
                    this.refreshPlayerAnswerHistoryFromRoom(this.room);
                }
            } else {
                this.quizStageStore.setUnknownRoom();
            }
        }
    }

    // endregion
}
</script>
