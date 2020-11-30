import { Component, Mixins, Watch } from 'vue-property-decorator';
import Player, { createDefaultPlayer } from 'src/models/Player';
import QuizStore from 'src/store/modules/QuizStore';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import Room from 'src/models/Room';
import QuizAnswer from 'src/models/QuizAnswer';
import SocketMixin from 'src/mixins/socketMixin';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';
import PlayerAnswerHistory, { createDefaultPlayerAnswerHistory } from 'src/models/PlayerAnswerHistory';
import { quizList } from 'src/models/Quiz';
import UserMixin from 'src/mixins/userMixin';
import PlayerAnswer, { createDefaultPlayerAnswer } from 'src/models/PlayerAnswer';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import { copyToClipboard } from 'quasar';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import { createDefaultTime, createNewTime, Time } from 'src/models/Time';

@Component
export default class QuizMixin extends Mixins(SocketMixin, QuizConfigurationMixin, UserMixin) {
    // region Data

    public timeElapseIntervalId: number = 0;

    public timeRemainingIntervalId: number = 0;

    public timeElapsed: Time = createDefaultTime();

    public timeRemaining: Time = createDefaultTime();

    /**
     * Données de la modale historique des réponses pour tous les joueurs.
     */
    public modalAnswersAllHistories: { display: boolean } = {
        display: false,
    };

    /**
     * Données de la modale historique des réponses pour 1 joueur.
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
        answerInput: HTMLFormElement;
        stopWatch: HTMLFormElement;
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
        if (this.isMultiplayer) {
            return this.roomSocketStore.room;
        }

        return undefined;
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

    public get lastPlayerAnswerHistory(): PlayerAnswerHistory | null {
        const playerAnswerHistory: PlayerAnswerHistory | null = this.player.answersHistory[this.player.answersHistory.length - 1];

        if (playerAnswerHistory?.startDate && typeof playerAnswerHistory.startDate === 'string') {
            playerAnswerHistory.startDate = new Date(playerAnswerHistory.startDate);
        }

        return playerAnswerHistory;
    }

    // endregion

    // region Hooks

    public beforeMount() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.timeElapseIntervalId = setInterval(() => {
            this.refreshTimeElapse();
        }, 10);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.timeRemainingIntervalId = setInterval(() => {
            this.refreshTimeRemaining();
        }, 10);
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * Une fois le quiz monté, initialise le quiz.
     * @public
     */
    public mounted() {
        QuizStageStore.setLoading();

        this.initQuizConfiguration();

        window.addEventListener('keydown', this.onKeyPress);
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * Lorsque le composant est démonté, supprime les raccourcis liés au quiz.
     */
    public unmounted() {
        window.removeEventListener('keydown', this.onKeyPress);

        clearInterval(this.timeElapseIntervalId);
    }

    // endregion

    // region Events handlers

    public onModalToggleAnswersHistory(player?: Player) {
        this.toggleModalAnswersHistory(player);
    }

    public onToggleModalAnswersAllHistories() {
        this.toggleModalAnswersAllHistories();
    }

    public onPickNext() {
        this.answerGivenByPlayer = '';

        if (this.$refs.quiz) {
            this.$refs.quiz.focusAnswerInput();
        }
    }

    public onSkip() {
        this.updateLastAnswer(false, true);
        this.$emit('skip');
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

        if (this.quizConfiguration.quiz.secondsPerQuestion) {
            const endDate = new Date(emptyAnswer.startDate.getTime());
            endDate.setSeconds(endDate.getSeconds() + this.quizConfiguration.quiz.secondsPerQuestion);
            emptyAnswer.endDate = endDate;
        }

        this.player.answersHistory = [...this.player.answersHistory, emptyAnswer];
    }

    /**
     * Affiche ou masque la modale de l'historique des réponses d'1 joueur.
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

    /**
     * Affiche ou masque la modale de l'historique des réponses de tous les joueurs.
     */
    public toggleModalAnswersAllHistories() {
        this.modalAnswersAllHistories.display = !this.modalAnswersAllHistories.display;
    }

    public refreshPlayerAnswerHistoryFromRoom(room: Room) {
        const playerFound = room.players.find(p => p.id === this.modalAnswersHistory.player.id);

        if (playerFound) {
            this.modalAnswersHistory.player = playerFound;
        }
    }

    /**
     * Met à jour la dernière réponse donnée par le joueur.
     * @param found L'objet a été trouvé.
     * @param skipped L'objet a été passé.
     * @param addNewAnswer
     * @public
     */
    public updateLastAnswer(found: boolean, skipped: boolean, addNewAnswer: boolean = false) {
        if (this.lastPlayerAnswerHistory) {
            this.lastPlayerAnswerHistory.found = found;
            this.lastPlayerAnswerHistory.skipped = skipped;
            this.lastPlayerAnswerHistory.timeElapsed = this.timeElapsed;

            if (addNewAnswer && this.answerGivenByPlayer.trim()) {
                const newAnswer: PlayerAnswer = createDefaultPlayerAnswer();
                newAnswer.value = this.answerGivenByPlayer.trim();
                newAnswer.isRight = found;
                this.lastPlayerAnswerHistory.answers = [...this.lastPlayerAnswerHistory.answers, newAnswer];
            }

            if (this.isMultiplayer && this.room) {
                this.updatePlayer();
            }
        }
    }

    /**
     * Met à jour le joueur courant.
     */
    public updatePlayer() {
        if (this.room) {
            this.roomSocketStore.updatePlayer({
                room: this.room,
                player: this.player,
            });
        }
    }

    /**
     * Focus sur le champs de réponse.
     */
    public focusAnswerInput() {
        setTimeout(() => {
            if (this.$refs.answerInput) {
                this.$refs.answerInput.focus();
            }
        }, 20);
    }

    /**
     * Ajoute les raccourcis liés au quiz.
     */
    public onKeyPress(e: KeyboardEvent) {
        if (QuizStageStore.isAnswering) {
            if (e.shiftKey && e.key === '/') {
                this.focusAnswerInput();
            }

            if (e.key === 'F9') {
                this.$emit('skip');
            }
        }

        if (QuizStageStore.isQuizFinished) {
            if (e.key === 'h') {
                this.toggleModalAnswersHistory();
            }

            if (e.key === 'r') {
                setTimeout(() => {
                    this.$emit('play-again');
                }, 20);
            }
        }
    }

    /**
     * Sélectionne le prochain élément.
     * @public
     */
    public pickNext(quizConfiguration: QuizConfiguration | QuizConfigurationItem | QuizConfigurationChampion, addEmptyAnswerToHistory: boolean = true): ItemLolApi | ChampionLolApi | null {
        // Si la question actuelle du joueur dépasse le nombre total de questions du quiz,
        // cela veut dire qu'il a terminé le quiz.
        // Sinon, sélectionne le prochain objet.
        if (this.player.currentQuestionNumber >= quizConfiguration.numberQuestions) {
            QuizStageStore.setQuizFinished();

            this.player = { ...this.player, hasFinished: true };

            if (this.isMultiplayer && this.room) {
                this.roomSocketStore.updatePlayer({
                    room: this.room,
                    player: this.player,
                });
            }

            return null;
        }

        this.player = {
            ...this.player,
            currentQuestionNumber: this.player.currentQuestionNumber + 1,
        };

        let elementToGuess: ItemLolApi | ChampionLolApi | null = null;

        if ('items' in quizConfiguration) {
            elementToGuess = quizConfiguration.items[this.player.currentQuestionNumber - 1];
        } else if ('champions' in quizConfiguration) {
            elementToGuess = quizConfiguration.champions[this.player.currentQuestionNumber - 1];
        }

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
            console.log(`%c ${this.currentQuizAnswer.value}`, 'color: #bada55', elementToGuess);
        }

        return elementToGuess;
    }

    /**
     * Vérifie la réponse donnée par le joueur.
     * @public
     */
    public verifyAnswer(): boolean {
        if (this.currentQuizAnswer) {
            // Garde seulement les caractère alphanumérique du nom de l'objet et de la réponse donnée par le joueur.
            // Si les 2 valeurs sont identiques, le joueur a donné la bonne réponse.
            const quizAnswer = this.currentQuizAnswer.value.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const playerAnswer = this.answerGivenByPlayer.replace(/[^a-z0-9]/gi, '').toLowerCase();

            const answerIsRight = quizAnswer === playerAnswer;

            this.updateLastAnswer(answerIsRight, false, true);

            if (this.quizConfiguration.quiz.clearAnswerInputAfterVerify) {
                this.answerGivenByPlayer = '';
                this.focusAnswerInput();
            }

            return answerIsRight;
        }

        return false;
    }

    public refreshTimeElapse() {
        if (this.lastPlayerAnswerHistory?.startDate) {
            const timeElapsed = new Date().getTime() - this.lastPlayerAnswerHistory.startDate.getTime();
            this.timeElapsed = createNewTime(timeElapsed);
        }
    }

    public refreshTimeRemaining() {
        if (this.lastPlayerAnswerHistory?.startDate) {
            if (this.lastPlayerAnswerHistory.startDate && this.lastPlayerAnswerHistory.endDate) {
                const timeRemaining = this.lastPlayerAnswerHistory.endDate.getTime() - new Date().getTime();

                if (timeRemaining < 0) {
                    this.timeRemaining = createNewTime(0);
                } else {
                    this.timeRemaining = createNewTime(timeRemaining);
                }
            }
        }
    }

    // endregion

    // region Watchers

    @Watch('room', { deep: true })
    public onRoomChanged() {
        if (this.isMultiplayer && this.modalAnswersHistory.display && this.room) {
            this.refreshPlayerAnswerHistoryFromRoom(this.room);
        }
    }

    // endregion
}
