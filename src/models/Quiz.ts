import Model from 'src/models/Model';
import { uniqueID } from 'src/utils/number';

export default interface Quiz extends Model {
    name: string;
    internalName: QuizListInternalName | '';
    canSkipQuestion: boolean;
    onlyOneTry: boolean; // L'utilisateur n'a qu'un seul essai.
    scoreBasedOnQuestionNumber: boolean; // Le score est basé sur le nombre de question correcte. 1 bonne réponse = 1 point.
    winnerHasTheLowestScore: boolean;
    answersAreOnlyNumber: boolean;
}

export function createDefaultQuiz(): Quiz {
    return {
        id: uniqueID(),
        name: '',
        internalName: '',
        canSkipQuestion: true,
        onlyOneTry: false,
        scoreBasedOnQuestionNumber: true,
        winnerHasTheLowestScore: false,
        answersAreOnlyNumber: false,
    };
}

export enum QuizListInternalName {
    ItemNameQuiz = 'item-name-quiz',
    ItemPriceQuiz = 'item-price-quiz',
    AnUltraSecretQuiz = 'an-ultra-secret-quiz',
}

export const quizList: Quiz[] = [
    {
        id: '1',
        name: `Find item's name`,
        internalName: QuizListInternalName.ItemNameQuiz,
        canSkipQuestion: true,
        onlyOneTry: false,
        scoreBasedOnQuestionNumber: true,
        winnerHasTheLowestScore: false,
        answersAreOnlyNumber: false,
    },

    {
        id: '2',
        name: `Find item's price`,
        internalName: QuizListInternalName.ItemPriceQuiz,
        canSkipQuestion: false,
        onlyOneTry: true,
        scoreBasedOnQuestionNumber: false,
        winnerHasTheLowestScore: true,
        answersAreOnlyNumber: true,
    },

    {
        id: '3',
        name: `Ultra secret quiz ... chut !`,
        internalName: QuizListInternalName.AnUltraSecretQuiz,
        canSkipQuestion: true,
        onlyOneTry: false,
        scoreBasedOnQuestionNumber: true,
        winnerHasTheLowestScore: false,
        answersAreOnlyNumber: false,
    },
];
