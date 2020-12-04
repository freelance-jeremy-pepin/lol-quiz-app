import { Component, Mixins } from 'vue-property-decorator';
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
import { createNewTime, Time } from 'src/models/Time';
import QuizConfigurationRune from 'src/models/QuizConfigurationRune';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import { uniqueID } from 'src/utils/number';

@Component
export default class QuizMixin extends Mixins(SocketMixin, QuizConfigurationMixin, UserMixin) {
    // region Data

    public timesIntervalId: number = 0;

    public playAgain: (() => void) | null = null;

    public skip: (() => void) | null = null;

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
        player = { ...player, userId: this.me.id };
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

    public get nextRoom(): Room | null | undefined {
        if (this.room?.nextRoomId) {
            return this.roomSocketStore.rooms.find(r => r.id === this.room?.nextRoomId && !r.inGame);
        }

        return null;
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

    public get timeElapsed(): Time {
        return QuizStore.timeElapsed;
    }

    public set timeElapsed(value: Time) {
        QuizStore.setTimeElapsed(value);
    }

    public get timeRemaining(): Time {
        return QuizStore.timeRemaining;
    }

    public set timeRemaining(value: Time) {
        QuizStore.setTimeRemaining(value);
    }

    public get refAnswerInput(): HTMLElement | null {
        return QuizStore.refAnswerInput;
    }

    // endregion

    // region Hooks

    public beforeMount() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.timesIntervalId = setInterval(() => {
            this.refreshTimeElapse();
            this.refreshTimeRemaining();
        }, 10);

        this.roomSocketStore.getAllRooms();
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
     * Avant que le composant soit détruit, supprime les raccourcis liés au quiz.
     */
    public beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyPress);

        clearInterval(this.timesIntervalId);

        if (this.room) {
            this.roomSocketStore.updatePlayer({
                room: this.room,
                player: { ...this.player, hasQuitRoom: true },
            });
        }
    }

    // endregion

    // region Events handlers

    public onPickNext() {
        this.answerGivenByPlayer = '';

        this.focusAnswerInput();
    }

    public onSkip() {
        this.updateLastAnswer(false, true);
    }

    /**
     * Vérifie la réponse donnée par l'utilisateur.
     * @private
     */
    private onVerifyAnswer(onCorrectAnswerCallback: (() => void) | null = null, onAnsweredCallback: (() => void) | null = null) {
        const answerIsCorrect = this.verifyAnswer();

        if (this.quizConfiguration.quiz.onlyOneTry) {
            if (onAnsweredCallback) {
                onAnsweredCallback();
            }

            this.focusAnswerInput();
        } else {
            QuizStageStore.setVerifyingAnswer();

            if (answerIsCorrect) {
                if (onCorrectAnswerCallback) {
                    onCorrectAnswerCallback();
                }
            } else {
                QuizStageStore.setWrong();

                setTimeout(() => {
                    if (QuizStageStore.isWrong) {
                        QuizStageStore.setAnswering();
                    }
                }, 1000);
            }
        }
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

            if (this.$route.query.imageType) {
                const quizConfiguration: QuizConfigurationChampion = this.quizConfiguration as QuizConfigurationChampion;
                quizConfiguration.imageType = this.$route.query.imageType.toString();
            }
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
            if (this.refAnswerInput) {
                this.refAnswerInput.focus();
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
                if (this.skip) {
                    this.skip();
                }
            }
        }

        if (QuizStageStore.isAnswering || QuizStageStore.isWrong) {
            if (!this.quizConfiguration.quiz.onlyOneTry && e.key === 'ArrowUp' && this.lastPlayerAnswerHistory?.answers && this.lastPlayerAnswerHistory.answers.length > 0 && this.refAnswerInput) {
                this.refAnswerInput.blur();
                this.answerGivenByPlayer = this.lastPlayerAnswerHistory.answers[this.lastPlayerAnswerHistory.answers.length - 1].value;
                this.focusAnswerInput();
            }
        }

        if (QuizStageStore.isQuizFinished) {
            if (e.key === 'h') {
                QuizStore.setDisplayPlayersAnswersHistories(!QuizStore.displayPlayersAnswersHistories);
            }

            if (e.key === 'r') {
                setTimeout(() => {
                    if (this.playAgain) {
                        this.playAgain();
                    }
                }, 20);
            }
        }
    }

    /**
     * Sélectionne le prochain élément.
     * @public
     */
    public pickNext(quizConfiguration: QuizConfiguration | QuizConfigurationItem | QuizConfigurationChampion | QuizConfigurationRune, addEmptyAnswerToHistory: boolean = true): ItemLolApi | ChampionLolApi | RuneLolApi | null {
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
        } else if ('runes' in quizConfiguration) {
            elementToGuess = quizConfiguration.runes[this.player.currentQuestionNumber - 1];
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
        // noinspection SuspiciousTypeOfGuard
        if (this.lastPlayerAnswerHistory?.startDate && this.lastPlayerAnswerHistory.startDate instanceof Date) {
            const timeElapsed = new Date().getTime() - this.lastPlayerAnswerHistory.startDate.getTime();
            this.timeElapsed = createNewTime(timeElapsed);
        }
    }

    public refreshTimeRemaining() {
        if (this.lastPlayerAnswerHistory?.startDate) {
            // noinspection SuspiciousTypeOfGuard
            if (this.lastPlayerAnswerHistory.startDate && this.lastPlayerAnswerHistory.endDate && this.lastPlayerAnswerHistory.endDate instanceof Date) {
                const timeRemaining = this.lastPlayerAnswerHistory.endDate.getTime() - new Date().getTime();

                if (timeRemaining < 0) {
                    this.timeRemaining = createNewTime(0);
                } else {
                    this.timeRemaining = createNewTime(timeRemaining);
                }
            }
        }
    }

    public playAgainMultiplayer() {
        if (this.room) {
            let nextRoom: Room | undefined | null = null;

            if (this.nextRoom) {
                nextRoom = this.nextRoom;
            } else {
                // Créer la prochaine salle.
                nextRoom = { ...this.room, id: uniqueID(), inGame: false, players: [] };
                nextRoom.quizConfiguration = this.specialiseQuizConfiguration(this.quizConfiguration);
                this.roomSocketStore.createOrUpdateRoom(nextRoom);
                this.roomSocketStore.createOrUpdateRoom({ ...this.room, nextRoomId: nextRoom.id });
            }

            if (nextRoom) {
                let player = createDefaultPlayer();

                player = {
                    ...player,
                    userId: this.player.userId,
                };

                this.roomSocketStore.joinRoom({ roomToJoin: nextRoom, player });

                this.$router.push({
                    path: `/room/${nextRoom.id}`,
                });
            }
        }
    }

    // endregion
}
