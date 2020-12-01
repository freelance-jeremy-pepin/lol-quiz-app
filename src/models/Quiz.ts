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
    secondsPerQuestion: number;
    clearAnswerInputAfterVerify: boolean;
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
        secondsPerQuestion: 0,
        clearAnswerInputAfterVerify: false,
    };
}

export enum QuizListInternalName {
    ItemName = 'item-name',
    ItemPrice = 'item-price',
    ChampionImage = 'champion-image',
}

export const quizList: Quiz[] = [
    {
        id: '1',
        name: `Find item's name`,
        internalName: QuizListInternalName.ItemName,
        canSkipQuestion: true,
        onlyOneTry: false,
        scoreBasedOnQuestionNumber: true,
        winnerHasTheLowestScore: false,
        answersAreOnlyNumber: false,
        secondsPerQuestion: 0,
        clearAnswerInputAfterVerify: false,
    },

    {
        id: '2',
        name: `Find item's price`,
        internalName: QuizListInternalName.ItemPrice,
        canSkipQuestion: false,
        onlyOneTry: true,
        scoreBasedOnQuestionNumber: false,
        winnerHasTheLowestScore: true,
        answersAreOnlyNumber: true,
        secondsPerQuestion: 0,
        clearAnswerInputAfterVerify: false,
    },

    {
        id: '3',
        name: `Find champion's image`,
        internalName: QuizListInternalName.ChampionImage,
        canSkipQuestion: true,
        onlyOneTry: false,
        scoreBasedOnQuestionNumber: false,
        winnerHasTheLowestScore: false,
        answersAreOnlyNumber: false,
        secondsPerQuestion: 20,
        clearAnswerInputAfterVerify: true,
    },
];

export interface FindChampionWithSplashArtScoreCalculation {
    secondMax: number;
    pixelateValueSplash: number;
    pixelateValueLoading: number;
    score: number;
}

export const findChampionWithSplashArtScoreCalculation: FindChampionWithSplashArtScoreCalculation[] = [
    {
        secondMax: 5,
        pixelateValueSplash: 90,
        pixelateValueLoading: 50,
        score: 4,
    },
    {
        secondMax: 10,
        pixelateValueSplash: 75,
        pixelateValueLoading: 40,
        score: 3,
    },
    {
        secondMax: 15,
        pixelateValueSplash: 60,
        pixelateValueLoading: 30,
        score: 2,
    },
    {
        secondMax: 20,
        pixelateValueSplash: 45,
        pixelateValueLoading: 20,
        score: 1,
    },
    {
        secondMax: 22,
        pixelateValueSplash: 1,
        pixelateValueLoading: 1,
        score: 0,
    },
];
