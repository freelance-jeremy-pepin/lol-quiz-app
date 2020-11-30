import { Component, Mixins, Watch } from 'vue-property-decorator';
import QuizMixin from 'src/mixins/quizMixin';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import Room from 'src/models/Room';
import QuizItemStore from 'src/store/modules/QuizItemStore';

@Component
export default class QuizItemMixin extends Mixins(QuizMixin) {
    // region Computed properties

    public get itemToGuess(): ItemLolApi | null {
        return QuizItemStore.itemToGuess;
    }

    public set itemToGuess(value: ItemLolApi | null) {
        QuizItemStore.setItemToGuess(value);
    }

    /**
     * Récupère la liste de tous les objets du jeu.
     * Les objets tels que les consommables et nécessitant un champion sont exclus.
     * @public
     */
    public get items(): ItemLolApi[] {
        return ItemLolApiStore.itemsFilteredForQuiz;
    }

    // endregion

    // region Events handlers

    /**
     * Démarre un nouveau quiz.
     * @public
     */
    public onStartNewQuiz() {
        this.startNewQuiz();
    }

    /**
     * Sélectionne le prochain objet.
     * @public
     */
    public onPickNextItem() {
        this.pickNextItem();

        this.onPickNext();
    }

    /**
     * Passe au prochain objet.
     * @public
     */
    public onSkipItem() {
        this.onSkip();
        this.skipItem();
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
            this.onPickNextItem();
        }

        QuizStageStore.setAnswering();
    }

    /**
     * Démarre le premier quiz.
     * Le quiz depuis cette est lancé seulement si le quiz est en mode chargement
     * et que les objets ont été récupérés.
     */
    public firstStartNewQuiz() {
        if (QuizStageStore.isLoading && this.items) {
            this.startNewQuiz();
        }
    }

    /**
     * Sélectionne le prochain objet.
     * @public
     */
    public pickNextItem(addEmptyAnswerToHistory: boolean = true) {
        const itemToGuess = this.pickNext(this.quizConfiguration, addEmptyAnswerToHistory) as ItemLolApi;

        if (itemToGuess) {
            this.itemToGuess = itemToGuess;
        }
    }

    /**
     * Passe au prochain objet.
     * @public
     */
    public skipItem() {
        if (this.quizConfiguration.quiz.canSkipQuestion) {
            this.onPickNextItem();
        }
    }

    /**
     * Modifie la configuration du quiz à partir d'une salle.
     */
    public setQuizConfigurationItemFromRoom(room: Room) {
        this.quizConfiguration = room.quizConfiguration as QuizConfigurationItem;

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
                const quizConfiguration: QuizConfigurationItem = this.quizConfiguration as QuizConfigurationItem;

                // Initialise la configuration du quiz seulement si elle n'a pas déjà été initialisée.
                if (!quizConfiguration.items || quizConfiguration.items.length < 1) {
                    this.setQuizConfigurationItemFromRoom(this.room);
                }
            } else {
                this.quizStageStore.setUnknownRoom();
            }
        }
    }

    // endregion
}
