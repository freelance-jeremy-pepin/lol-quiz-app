import { Component, Mixins } from 'vue-property-decorator';
import Player, { createDefaultPlayer } from 'src/models/Player';
import QuizStore from 'src/store/modules/QuizStore';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import Room from 'src/models/Room';
import QuizAnswer from 'src/models/QuizAnswer';
import SocketMixin from 'src/mixins/socketMixin';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';
import { createDefaultPlayerAnswerHistory } from 'src/models/PlayerAnswerHistory';
import { quizList } from 'src/models/Quiz';
import UserMixin from 'src/mixins/userMixin';

@Component
export default class QuizMixin extends Mixins(SocketMixin, QuizConfigurationMixin, UserMixin) {
    // region Data

    /**
     * Données de la modale historique des réponses.
     */
    public modalAnswersHistory: { display: boolean, player: Player } = {
        display: false,
        player: createDefaultPlayer(),
    };

    /**
     * Références des composants enfants.
     */
    public $refs!: {
        quiz: HTMLFormElement;
    };

    // endregion

    // region Computed properties

    /**
     * Récupère le joueur du quiz.
     * @public
     */
    public get player(): Player {
        return QuizStore.player;
    }

    /**
     * Modifier le joueur du quiz.
     * @public
     */
    public set player(player: Player) {
        QuizStore.setPlayer(player);
    }

    /**
     * Store détenant l'état du quiz.
     */
    public get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
    }

    public get room(): Room | undefined | null {
        return this.roomSocketStore.room;
    }

    public get currentQuizAnswer(): QuizAnswer {
        return this.quizConfiguration.answers[this.player.currentQuestionNumber - 1];
    }

    public get isMultiplayer(): boolean {
        return QuizStore.isMultiplayer;
    }

    public set isMultiplayer(value: boolean) {
        QuizStore.setIsMultiplayer(value);
    }

    public get quizConfiguration(): QuizConfiguration {
        return QuizStore.quizConfiguration;
    }

    public set quizConfiguration(value: QuizConfiguration) {
        QuizStore.setQuizConfiguration(value);
    }

    public get answerGivenByPlayer(): string {
        return QuizStore.answerGivenByPlayer;
    }

    public set answerGivenByPlayer(value: string) {
        QuizStore.setAnswerGivenByPlayer(value);
    }

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    /**
     * Une fois le quiz monté, initialise le quiz.
     * @private
     */
    private mounted() {
        QuizStageStore.setLoading();

        this.initQuizConfiguration();
    }

    // endregion

    // region Events handlers

    public onModalToggleAnswersHistory(player?: Player) {
        this.toggleModalAnswersHistory(player);
    }

    // endregion

    // region Methods

    /**
     * Initialise la configuration du quiz.
     * @public
     */
    public initQuizConfiguration() {
        this.quizConfiguration = createDefaultQuizConfiguration();

        // Si la salle est renseignée, cela veut dire que le quiz est fait en multi joueur.
        // Sinon, le quiz est fait en solo.
        if (this.$route.query.room) {
            this.isMultiplayer = true;

            this.roomSocketStore.getRoomById({
                id: this.$route.query.room.toString(),
                user: this.me,
            });
        } else {
            this.isMultiplayer = false;

            const quiz = quizList.find(q => q.id === this.$route.query.quiz);

            if (!quiz) {
                throw new Error('Unknown quiz');
            }

            this.quizConfiguration = {
                ...this.quizConfiguration,
                quiz,
                numberQuestions: this.$route.query.numberQuestions ? parseInt(this.$route.query.numberQuestions.toString(), 10) : 5,
                withStopWatch: this.$route.query.withStopWatch ? this.$route.query.withStopWatch.toString() === 'true' : false,
            };
        }
    }

    /**
     * RaZ le quiz.
     * @public
     */
    public resetQuiz() {
        this.player = {
            ...this.player,
            currentQuestionNumber: 0,
            score: 0,
            answersHistory: [],
        };

        if (!this.isMultiplayer) {
            this.quizConfiguration = this.specialiseQuizConfiguration(this.quizConfiguration);
        }
    }

    /**
     * Ajoute une réponse vide à l'historique des réponses du joueur.
     * @public
     */
    public addEmptyAnswerToHistory() {
        const emptyAnswer = createDefaultPlayerAnswerHistory();
        this.player.answersHistory = [...this.player.answersHistory, emptyAnswer];
    }

    /**
     * Affiche ou masque la modale de l'historique des réponses.
     */
    public toggleModalAnswersHistory(player?: Player) {
        if (!this.modalAnswersHistory.display) {
            if (player) {
                this.modalAnswersHistory.player = player;
            } else {
                this.modalAnswersHistory.player = this.player;
            }
        }

        this.modalAnswersHistory.display = !this.modalAnswersHistory.display;
    }

    public refreshPlayerAnswerHistoryFromRoom(room: Room) {
        const playerFound = room.players.find(p => p.id === this.modalAnswersHistory.player.id);

        if (playerFound) {
            this.modalAnswersHistory.player = playerFound;
        }
    }

    // endregion
}
