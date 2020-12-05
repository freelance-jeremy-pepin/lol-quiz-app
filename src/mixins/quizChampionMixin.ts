import { Component, Mixins, Watch } from 'vue-property-decorator';
import QuizMixin from 'src/mixins/quizMixin';
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import ChampionLolApiStore from 'src/store/modules/LolApi/ChampionLolApiStore';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import Room from 'src/models/Room';
import QuizChampionStore from 'src/store/modules/QuizChampionStore';

@Component
export default class QuizChampionMixin extends Mixins(QuizMixin) {
    // region Computed properties

    // noinspection JSUnusedGlobalSymbols
    public get championToGuess(): ChampionLolApi | null {
        return QuizChampionStore.championToGuess;
    }

    public set championToGuess(value: ChampionLolApi | null) {
        QuizChampionStore.setChampionToGuess(value);
    }

    /**
     * Récupère la liste de tous les champions du jeu.
     * Les champions tels que les consommables et nécessitant un champion sont exclus.
     * @public
     */
    public get champions(): ChampionLolApi[] {
        return ChampionLolApiStore.champions;
    }

    // endregion

    // region Hooks

    public mounted() {
        this.playAgain = this.onPlayAgain;
        this.skip = this.onSkipChampion;

        if (!this.isMultiplayer) {
            this.startNewQuiz();
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
            this.startNewQuiz();
        }
    }

    /**
     * Sélectionne le prochain objet.
     * @public
     */
    public onPickNextChampion() {
        this.pickNextChampion();

        this.onPickNext();
    }

    /**
     * Passe au prochain objet.
     * @public
     */
    public onSkipChampion() {
        this.onSkip();
        this.skipChampion();
    }

    // endregion

    // region Methods

    /**
     * Démarre un nouveau quiz.
     * @public
     */
    public startNewQuiz() {
        this.resetQuiz();

        if (!this.isMultiplayer) {
            this.onPickNextChampion();
        }

        QuizStageStore.setAnswering();
    }

    /**
     * Sélectionne le prochain champion.
     * @public
     */
    public pickNextChampion(addEmptyAnswerToHistory: boolean = true) {
        const championToGuess = this.pickNext(this.quizConfiguration, addEmptyAnswerToHistory) as ChampionLolApi;

        if (championToGuess) {
            this.championToGuess = championToGuess;
        }
    }

    /**
     * Passe au prochain objet.
     * @public
     */
    public skipChampion() {
        if (this.quizConfiguration.quiz.canSkipQuestion) {
            this.onPickNextChampion();
        }
    }

    /**
     * Modifie la configuration du quiz à partir d'une salle.
     */
    public setQuizConfigurationChampionFromRoom(room: Room) {
        this.quizConfiguration = room.quizConfiguration as QuizConfigurationChampion;

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

            this.pickNextChampion(addEmptyAnswerToHistory);
        }
    }

    // endregion

    // region Watchers

    /**
     * Dès que la salle a été récupérée, initialise le quiz.
     * Dès que la salle change et si l'historique des réponses est ouverte, met à jour l'historique.
     * @public
     */
    @Watch('room', { deep: true })
    public onRoomChanged() {
        if (this.isMultiplayer) {
            if (this.room) {
                const quizConfiguration: QuizConfigurationChampion = this.quizConfiguration as QuizConfigurationChampion;

                // Initialise la configuration du quiz seulement si elle n'a pas déjà été initialisée.
                if (!quizConfiguration.champions || quizConfiguration.champions.length < 1) {
                    this.setQuizConfigurationChampionFromRoom(this.room);
                }
            } else {
                this.quizStageStore.setUnknownRoom();
            }
        }
    }

    // endregion
}
