import { Component, Mixins, Watch } from 'vue-property-decorator';
import QuizMixin from 'src/mixins/quizMixin';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import { copyToClipboard } from 'quasar';
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

        this.answerGivenByPlayer = '';

        if (this.$refs.quiz) {
            this.$refs.quiz.focusAnswerInput();
        }
    }

    /**
     * Passe au prochain objet.
     * @public
     */
    public onSkipItem() {
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
        // Si la question actuelle du joueur dépasse le nombre total de questions du quiz,
        // cela veut dire qu'il a terminé le quiz.
        // Sinon, sélectionne le prochain objet.
        if (this.player.currentQuestionNumber >= this.quizConfiguration.numberQuestions) {
            QuizStageStore.setQuizFinished();

            if (this.isMultiplayer && this.room) {
                this.roomSocketStore.updatePlayer({
                    room: this.room,
                    player: { ...this.player, hasFinished: true },
                });
            }

            return;
        }

        this.player = {
            ...this.player,
            currentQuestionNumber: this.player.currentQuestionNumber + 1,
        };

        const quizConfiguration: QuizConfigurationItem = this.quizConfiguration as QuizConfigurationItem;
        this.itemToGuess = quizConfiguration.items[this.player.currentQuestionNumber - 1];

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
            console.log(`%c ${this.currentQuizAnswer.value}`, 'color: #bada55', this.itemToGuess);
        }
    }

    /**
     * Passe au prochain objet.
     * @public
     */
    public skipItem() {
        this.onPickNextItem();
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

                if (this.modalAnswersHistory.display) {
                    this.refreshPlayerAnswerHistoryFromRoom(this.room);
                }
            } else {
                this.quizStageStore.setUnknownRoom();
            }
        }
    }

    // endregion
}
