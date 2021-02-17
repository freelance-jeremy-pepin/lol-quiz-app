import { Component, Mixins } from 'vue-property-decorator';
import Player from 'src/models/Player';
import QuizStore from 'src/store/modules/QuizStore';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import Room from 'src/models/Room';
import QuizAnswer from 'src/models/QuizAnswer';
import QuizConfiguration from 'src/models/QuizConfiguration';
import PlayerAnswerHistory from 'src/models/PlayerAnswerHistory';
import { Time } from 'src/models/Time';
import UserMixin from 'src/mixins/userMixin';
import { ElementToGuess } from 'src/models/ElementToGuess';

@Component
export default class QuizStoreMixin extends Mixins(UserMixin) {
    // region Computed properties

    public get elementToGuess(): ElementToGuess | null {
        return QuizStore.elementToGuess;
    }

    public set elementToGuess(value: ElementToGuess | null) {
        QuizStore.setElementToGuess(value);
    }

    public get displayPlayersAnswersHistories(): boolean {
        return QuizStore.displayPlayersAnswersHistories;
    }

    public set displayPlayersAnswersHistories(value: boolean) {
        QuizStore.setDisplayPlayersAnswersHistories(value);
    }

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

    // noinspection JSUnusedLocalSymbols
    private get quizStageIsFinished(): boolean {
        return QuizStageStore.isQuizFinished;
    }

    // noinspection JSUnusedLocalSymbols
    private get quizStageIsAnswering(): boolean {
        return QuizStageStore.isAnswering;
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

        // noinspection SuspiciousTypeOfGuard
        if (playerAnswerHistory?.startDate && typeof playerAnswerHistory.startDate === 'string') {
            playerAnswerHistory.startDate = new Date(playerAnswerHistory.startDate);
        }

        return playerAnswerHistory;
    }

    public get timeElapsed(): Time | null {
        return QuizStore.timeElapsed;
    }

    public set timeElapsed(value: Time | null) {
        QuizStore.setTimeElapsed(value);
    }

    public get timeRemaining(): Time | null {
        return QuizStore.timeRemaining;
    }

    public set timeRemaining(value: Time | null) {
        QuizStore.setTimeRemaining(value);
    }

    // eslint-disable-next-line
    public get refQuiz(): any | null {
        // eslint-disable-next-line
        return QuizStore.refQuiz;
    }

    public get players(): Player[] {
        if (this.isMultiplayer && this.room) {
            return this.room.players;
        }

        if (this.player) {
            return [this.player];
        }

        return [];
    }

    // endregion
}
