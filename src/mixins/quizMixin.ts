import { Component, Mixins, Watch } from 'vue-property-decorator';
import { createDefaultPlayer } from 'src/models/Player';
import QuizStore from 'src/store/modules/QuizStore';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import Room, { createDefaultRoom } from 'src/models/Room';
import { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';
import { quizList } from 'src/models/Quiz';
import UserMixin from 'src/mixins/userMixin';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import { createNewTime } from 'src/models/Time';
import { uniqueID } from 'src/utils/number';
import QuizAnswerMixin from 'src/mixins/quizAnswerMixin';

@Component
export default class QuizMixin extends Mixins(QuizConfigurationMixin, UserMixin, QuizAnswerMixin) {
    // region Data

    private timeRemainingIntervalId: number = 0;

    private timeElapsedIntervalId: number = 0;

    // endregion

    // region Hooks

    public beforeMount() {
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

    // noinspection JSUnusedGlobalSymbols
    /**
     * Avant que le composant soit détruit, supprime les raccourcis liés au quiz.
     */
    public beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyPress);

        this.clearIntervals();

        if (this.room) {
            this.roomSocketStore.updatePlayer({
                room: this.room,
                player: { ...this.player, hasQuitRoom: true },
            });
        }
    }

    // endregion

    // region Events handlers

    /**
     * Démarre un nouveau quiz.
     * @public
     */
    public onPlayAgain() {
        if (this.isMultiplayer) {
            this.playAgainMultiplayer();
        } else {
            this.startQuiz();
        }
    }

    public onSkip() {
        this.skip();
    }

    // endregion

    // region Methods

    /**
     * Démarre un nouveau quiz.
     * @public
     */
    public startQuiz() {
        this.resetQuiz();

        if (!this.isMultiplayer) {
            this.onPickNext();
        }

        QuizStageStore.setAnswering();
    }

    /**
     * Passe au prochain élément.
     * @public
     */
    public skip() {
        if (this.quizConfiguration.quiz.canSkipQuestion) {
            this.updateLastAnswer(false, true);
            this.onPickNext();
        }
    }

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

            const roomId = this.$route.query.room.toString();
            if (this.room?.id !== roomId) {
                this.roomSocketStore.getRoomById({
                    id: this.$route.query.room.toString(),
                    user: this.me,
                });
            }
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

            if (this.$route.query.skins) {
                const quizConfiguration: QuizConfigurationChampion = this.quizConfiguration as QuizConfigurationChampion;
                quizConfiguration.skins = this.$route.query.skins.toString();
            }

            this.startQuiz();
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

        this.startIntervals();
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
     * Ajoute les raccourcis liés au quiz.
     */
    public onKeyPress(e: KeyboardEvent) {
        if (QuizStageStore.isAnswering || QuizStageStore.isWrong) {
            if (e.shiftKey && e.key === '/') {
                this.focusAnswerInput();
            }

            if (e.key === 'F9') {
                this.skip();
            }

            if (!this.quizConfiguration.quiz.onlyOneTry && e.key === 'ArrowUp' && this.lastPlayerAnswerHistory?.answers && this.lastPlayerAnswerHistory.answers.length > 0 && this.refQuiz) {
                e.preventDefault();
                this.refQuiz.blurAnswerInput();
                this.answerGivenByPlayer = this.lastPlayerAnswerHistory.answers[this.lastPlayerAnswerHistory.answers.length - 1].value;
                this.focusAnswerInput();
            }
        }

        if (QuizStageStore.isQuizFinished) {
            if (e.key === 'h') {
                QuizStore.setDisplayPlayersAnswersHistories(!QuizStore.displayPlayersAnswersHistories);
            }

            if (e.key === 'r') {
                this.onPlayAgain();
            }
        }
    }

    public refreshTimeElapsed() {
        // noinspection SuspiciousTypeOfGuard
        if (this.lastPlayerAnswerHistory?.startDate && this.lastPlayerAnswerHistory.startDate instanceof Date) {
            this.timeElapsed = createNewTime(new Date().getTime() - this.lastPlayerAnswerHistory.startDate.getTime());
        }
    }

    public refreshTimeRemaining() {
        // noinspection SuspiciousTypeOfGuard
        if (this.lastPlayerAnswerHistory?.endDate && this.lastPlayerAnswerHistory.endDate instanceof Date) {
            this.timeRemaining = createNewTime(this.lastPlayerAnswerHistory.endDate.getTime() - new Date().getTime());
        }
    }

    public playAgainMultiplayer() {
        if (this.room) {
            let nextRoom: Room | undefined | null;

            if (this.nextRoom) {
                nextRoom = this.nextRoom;
            } else {
                const newRoom = createDefaultRoom();

                // Créer la prochaine salle.
                nextRoom = {
                    ...this.room,
                    id: uniqueID(),
                    inGame: false,
                    players: [],
                    expiresAt: newRoom.expiresAt,
                };
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

                // noinspection JSIgnoredPromiseFromCall
                this.$router.push({
                    path: `/room/${nextRoom.id}`,
                });
            }
        }
    }

    private startIntervals() {
        if (this.quizConfiguration.quiz.enableTimeRemaining) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.timeRemainingIntervalId = setInterval(() => {
                this.refreshTimeRemaining();
            }, 10);
        }

        if (this.quizConfiguration.quiz.enableTimeElapsed) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.timeElapsedIntervalId = setInterval(() => {
                this.refreshTimeElapsed();
            }, 10);
        }
    }

    private clearIntervals() {
        if (this.timeRemainingIntervalId !== 0) {
            clearInterval(this.timeRemainingIntervalId);
        }

        if (this.timeElapsedIntervalId !== 0) {
            clearInterval(this.timeElapsedIntervalId);
        }
    }

    /**
     * Modifie la configuration du quiz à partir d'une salle.
     */
    public setQuizConfigurationFromRoom(room: Room) {
        this.quizConfiguration = room.quizConfiguration as QuizConfigurationItem;

        const playerFound = room.players.find(p => p.userId === this.me.id);

        if (playerFound) {
            this.player = playerFound;

            // Si le joueur a déjà commencé le quiz, on le place sur l'objet précédent pour sélectionner le suivant.
            let addEmptyAnswerToHistory = true;
            if (this.player.currentQuestionNumber > 0 && !this.player.hasFinished) {
                this.player = {
                    ...this.player,
                    currentQuestionNumber: this.player.currentQuestionNumber - 1,
                };
                addEmptyAnswerToHistory = false;
            }

            this.onPickNext(addEmptyAnswerToHistory);

            this.startIntervals();
        }
    }

    // endregion

    // region Watchers

    @Watch('quizStageIsFinished')
    private onQuizStageIsFinishedChanged(isQuizFinished: boolean) {
        if (isQuizFinished) {
            this.clearIntervals();
        }
    }

    @Watch('quizStageIsAnswering')
    private onQuizStageIsAnswering(isAnswering: boolean) {
        if (isAnswering) {
            this.focusAnswerInput();
        }
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
                if (this.quizStageStore.isLoading || this.quizStageStore.isUnknownRoom) {
                    this.setQuizConfigurationFromRoom(this.room);
                }
            } else {
                this.quizStageStore.setUnknownRoom();
            }
        }
    }

    // endregion
}
