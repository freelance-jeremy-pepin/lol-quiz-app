import { Component, Mixins } from 'vue-property-decorator';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import PlayerAnswer, { createDefaultPlayerAnswer } from 'src/models/PlayerAnswer';
import QuizStoreMixin from 'src/mixins/quizStoreMixin';
import QuizConfiguration from 'src/models/QuizConfiguration';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import QuizConfigurationRune from 'src/models/QuizConfigurationRune';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import { copyToClipboard } from 'quasar';
import { createDefaultPlayerAnswerHistory } from 'src/models/PlayerAnswerHistory';
import { createNewTime } from 'src/models/Time';
import QuizConfigurationChampionSpell from 'src/models/QuizConfigurationChampionSpell';
import ChampionSpellLolApi from 'src/models/LolApi/ChampionSpellLolApi';

@Component
export default class QuizAnswerMixin extends Mixins(QuizStoreMixin) {
    // region Events handlers

    /**
     * Vérifie la réponse donnée par l'utilisateur.
     * @public
     */
    public onVerifyAnswer(onCorrectAnswerCallback: (() => void) | null = null, onAnsweredCallback: (() => void) | null = null) {
        const answerIsCorrect = this.verifyAnswer();

        if (this.quizConfiguration.quiz.onlyOneTry) {
            if (onAnsweredCallback) {
                onAnsweredCallback();
            }

            this.onPickNext();
        } else {
            QuizStageStore.setVerifyingAnswer();

            if (answerIsCorrect) {
                if (onCorrectAnswerCallback) {
                    onCorrectAnswerCallback();
                }

                this.onPickNext();
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

    public onPickNext(addEmptyAnswerToHistory: boolean = true) {
        const elementToGuess = this.pickNext(this.quizConfiguration, addEmptyAnswerToHistory);

        if (elementToGuess) {
            this.elementToGuess = elementToGuess;
        }

        this.answerGivenByPlayer = '';

        this.focusAnswerInput();
    }

    // endregion

    // region Methods

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

            if (found && this.quizConfiguration.quiz.enableTimeElapsed && this.timeElapsed) {
                this.lastPlayerAnswerHistory.timeElapsed = this.timeElapsed;
            }

            if (found && this.quizConfiguration.quiz.enableTimeRemaining) {
                this.lastPlayerAnswerHistory.timeElapsed = createNewTime(new Date().getTime() - this.lastPlayerAnswerHistory.startDate.getTime());
            }

            if (addNewAnswer && this.answerGivenByPlayer.trim()) {
                const newAnswer: PlayerAnswer = createDefaultPlayerAnswer();
                newAnswer.value = this.answerGivenByPlayer.trim();
                newAnswer.isRight = found;
                this.lastPlayerAnswerHistory.answers = [...this.lastPlayerAnswerHistory.answers, newAnswer];
            }

            if (this.isMultiplayer && this.room) {
                this.roomSocketStore.updatePlayer({
                    room: this.room,
                    player: this.player,
                });
            }
        }
    }

    /**
     * Sélectionne le prochain élément.
     * @public
     */
    public pickNext(quizConfiguration: QuizConfiguration | QuizConfigurationItem | QuizConfigurationChampion | QuizConfigurationRune | QuizConfigurationChampionSpell, addEmptyAnswerToHistory: boolean = true): ItemLolApi | ChampionLolApi | RuneLolApi | ChampionSpellLolApi | null {
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

        let elementToGuess: ItemLolApi | ChampionLolApi | RuneLolApi | ChampionSpellLolApi | null = null;

        if ('items' in quizConfiguration) {
            elementToGuess = quizConfiguration.items[this.player.currentQuestionNumber - 1];
        } else if ('champions' in quizConfiguration) {
            elementToGuess = quizConfiguration.champions[this.player.currentQuestionNumber - 1];
        } else if ('runes' in quizConfiguration) {
            elementToGuess = quizConfiguration.runes[this.player.currentQuestionNumber - 1];
        }
        if ('spells' in quizConfiguration) {
            elementToGuess = quizConfiguration.spells[this.player.currentQuestionNumber - 1];
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
            // noinspection JSIgnoredPromiseFromCall
            copyToClipboard(this.currentQuizAnswer.value);

            // eslint-disable-next-line no-console
            console.log(`%c ${this.currentQuizAnswer.value}`, 'color: #bada55', elementToGuess);
        }

        return elementToGuess;
    }

    /**
     * Ajoute une réponse vide à l'historique des réponses du joueur.
     * @public
     */
    public addEmptyAnswerToHistory() {
        const emptyAnswer = createDefaultPlayerAnswerHistory();

        this.player.answersHistory = [...this.player.answersHistory, emptyAnswer];
    }

    public setDatesToLastPlayerAnswer() {
        if (this.lastPlayerAnswerHistory) {
            const startDate = new Date();
            this.lastPlayerAnswerHistory.startDate = startDate;

            if (this.quizConfiguration.quiz.secondsPerQuestion) {
                const endDate = new Date(startDate.getTime());
                endDate.setSeconds(endDate.getSeconds() + this.quizConfiguration.quiz.secondsPerQuestion);
                this.lastPlayerAnswerHistory.endDate = endDate;
            }
        }
    }

    /**
     * Focus sur le champs de réponse.
     */
    public focusAnswerInput() {
        setTimeout(() => {
            if (this.refQuiz) {
                this.refQuiz.focusAnswerInput();
            }
        }, 10);
    }

    // endregion
}
