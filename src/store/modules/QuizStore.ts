import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import Player, { createDefaultPlayer } from 'src/models/Player';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import { createDefaultTime, Time } from 'src/models/Time';
import { ElementToGuess } from 'src/models/ElementToGuess';

@Module({
    dynamic: true,
    store,
    name: 'quiz',
    namespaced: true,
})
class QuizStore extends VuexModule {
    // region State

    private _elementToGuess: ElementToGuess | null = null;

    /**
     * Réponse donnée par le joueur.
     * @private
     */
    private _answerGivenByPlayer: string = '';

    /**
     * Joueur du quiz.
     * @private
     */
    private _player: Player = createDefaultPlayer();

    /**
     * Le quiz est fait à plusieurs.
     * @private
     */
    private _isMultiplayer: boolean = false;

    /**
     * Configuration du quiz.
     * @private
     */
    private _quizConfiguration: QuizConfiguration = createDefaultQuizConfiguration();

    private _timeElapsed: Time = createDefaultTime();

    private _timeRemaining: Time = createDefaultTime();

    private _displayPlayersAnswersHistories: boolean = false;

    // eslint-disable-next-line
    private _refQuiz: any | null = null;

    // endregion

    // region Mutations

    @Mutation
    public setElementToGuess(elementToGuess: ElementToGuess | null) {
        this._elementToGuess = elementToGuess;
    }

    @Mutation
    public setAnswerGivenByPlayer(answerGivenByPlayer: string) {
        this._answerGivenByPlayer = answerGivenByPlayer;
    }

    @Mutation
    public setPlayer(player: Player) {
        this._player = player;
    }

    @Mutation
    public setIsMultiplayer(isMultiplayer: boolean) {
        this._isMultiplayer = isMultiplayer;
    }

    @Mutation
    public setQuizConfiguration(quizConfiguration: QuizConfiguration) {
        this._quizConfiguration = quizConfiguration;
    }

    @Mutation
    public setTimeElapsed(timeElapsed: Time) {
        this._timeElapsed = timeElapsed;
    }

    @Mutation
    public setTimeRemaining(timeRemaining: Time) {
        this._timeRemaining = timeRemaining;
    }

    @Mutation
    public setDisplayPlayersAnswersHistories(displayPlayersAnswersHistories: boolean) {
        this._displayPlayersAnswersHistories = displayPlayersAnswersHistories;
    }

    @Mutation
    // eslint-disable-next-line
    public setRefQuiz(refAnswerInput: any) {
        this._refQuiz = refAnswerInput;
    }

    // endregion

    // region Getters

    public get elementToGuess(): ElementToGuess | null {
        return this._elementToGuess;
    }

    public get answerGivenByPlayer(): string {
        return this._answerGivenByPlayer;
    }

    public get player(): Player {
        return this._player;
    }

    public get isMultiplayer(): boolean {
        return this._isMultiplayer;
    }

    public get quizConfiguration(): QuizConfiguration {
        return this._quizConfiguration;
    }

    public get timeElapsed(): Time {
        return this._timeElapsed;
    }

    public get timeRemaining(): Time {
        return this._timeRemaining;
    }

    public get displayPlayersAnswersHistories(): boolean {
        return this._displayPlayersAnswersHistories;
    }

    // eslint-disable-next-line
    public get refQuiz(): any | null {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._refQuiz;
    }

    // endregion
}

export default getModule(QuizStore);
