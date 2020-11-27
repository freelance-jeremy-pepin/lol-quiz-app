import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import Player, { createDefaultPlayer } from 'src/models/Player';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';

@Module({
    dynamic: true,
    store,
    name: 'quiz',
    namespaced: true,
})
class QuizStore extends VuexModule {
    // region State

    /**
     * Réponse donnée par le joueur.
     * @public
     */
    public _answerGivenByPlayer: string = '';

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
     * @public
     */
    public _quizConfiguration: QuizConfiguration = createDefaultQuizConfiguration();

    // endregion

    // region Mutations

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

    // endregion

    // region Getters

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

    // endregion
}

export default getModule(QuizStore);
