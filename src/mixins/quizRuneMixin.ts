import { Component, Mixins, Watch } from 'vue-property-decorator';
import QuizMixin from 'src/mixins/quizMixin';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import Room from 'src/models/Room';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import QuizRuneStore from 'src/store/modules/QuizRuneStore';
import RuneLolApiStore from 'src/store/modules/LolApi/RuneLolApiStore';
import QuizConfigurationRune from 'src/models/QuizConfigurationRune';

@Component
export default class QuizRuneMixin extends Mixins(QuizMixin) {
    // region Computed properties

    public get runeToGuess(): RuneLolApi | null {
        return QuizRuneStore.runeToGuess;
    }

    public set runeToGuess(value: RuneLolApi | null) {
        QuizRuneStore.setRuneToGuess(value);
    }

    /**
     * Récupère la liste de toutes les runes du jeu.
     * @public
     */
    public get runes(): RuneLolApi[] {
        return RuneLolApiStore.runes;
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
     * Sélectionne la prochaine rune.
     * @public
     */
    public onPickNextRune() {
        this.pickNextRune();

        this.onPickNext();
    }

    /**
     * Passe à la prochaine rune.
     * @public
     */
    public onSkipRune() {
        this.onSkip();
        this.skipRune();
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
            this.onPickNextRune();
        }

        QuizStageStore.setAnswering();
    }

    /**
     * Démarre le premier quiz.
     * Le quiz depuis cette est lancé seulement si le quiz est en mode chargement
     * et que les runes ont été récupérés.
     */
    public firstStartNewQuiz() {
        if (QuizStageStore.isLoading && this.runes) {
            this.startNewQuiz();
        }
    }

    /**
     * Sélectionne la prochaine rune.
     * @public
     */
    public pickNextRune(addEmptyAnswerToHistory: boolean = true) {
        const runeToGuess = this.pickNext(this.quizConfiguration, addEmptyAnswerToHistory) as RuneLolApi;

        if (runeToGuess) {
            this.runeToGuess = runeToGuess;
        }
    }

    /**
     * Passe à la prochaine rune.
     * @public
     */
    public skipRune() {
        if (this.quizConfiguration.quiz.canSkipQuestion) {
            this.onPickNextRune();
        }
    }

    /**
     * Modifie la configuration du quiz à partir d'une salle.
     */
    public setQuizConfigurationRuneFromRoom(room: Room) {
        this.quizConfiguration = room.quizConfiguration as QuizConfigurationRune;

        const playerFound = room.players.find(p => p.userId === this.me.id);

        if (playerFound) {
            this.player = playerFound;

            // TODO: à revoir
            // Si le joueur a déjà commencé le quiz, on le place sur la rune précédente pour sélectionner le suivant.
            let addEmptyAnswerToHistory = true;
            if (this.player.currentQuestionNumber > 0 && !this.player.hasFinished) {
                this.player = {
                    ...this.player,
                    currentQuestionNumber: this.player.currentQuestionNumber - 1,
                };
                addEmptyAnswerToHistory = false;
            }

            this.pickNextRune(addEmptyAnswerToHistory);
        }
    }

    // endregion

    // region Watchers

    /**
     * Lors du changement de la liste des runes, démarre le premier quiz.
     */
    @Watch('runes', { immediate: true })
    public onRunesChanged() {
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
                const quizConfiguration: QuizConfigurationRune = this.quizConfiguration as QuizConfigurationRune;

                // Initialise la configuration du quiz seulement si elle n'a pas déjà été initialisée.
                if (!quizConfiguration.runes || quizConfiguration.runes.length < 1) {
                    this.setQuizConfigurationRuneFromRoom(this.room);
                }
            } else {
                this.quizStageStore.setUnknownRoom();
            }
        }
    }

    // endregion
}
