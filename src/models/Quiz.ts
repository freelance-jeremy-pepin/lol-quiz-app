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
    enableTimeRemaining: boolean;
    enableTimeElapsed: boolean;
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
        enableTimeRemaining: false,
        enableTimeElapsed: false,
    };
}

export enum QuizListInternalName {
    ItemName = 'item-name',
    ItemPrice = 'item-price',
    ChampionImage = 'champion-image',
    RuneName = 'rune-name',
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
        enableTimeRemaining: false,
        enableTimeElapsed: false,
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
        enableTimeRemaining: false,
        enableTimeElapsed: false,
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
        enableTimeRemaining: true,
        enableTimeElapsed: false,
    },
    {
        id: '4',
        name: `Find rune's name`,
        internalName: QuizListInternalName.RuneName,
        canSkipQuestion: true,
        onlyOneTry: false,
        scoreBasedOnQuestionNumber: true,
        winnerHasTheLowestScore: false,
        answersAreOnlyNumber: false,
        secondsPerQuestion: 0,
        clearAnswerInputAfterVerify: false,
        enableTimeRemaining: false,
        enableTimeElapsed: false,
    },
];

export interface FindChampionWithSplashArtScoreCalculation {
    secondMin: number;
    pixelateValueSplash: number;
    pixelateValueLoading: number;
    score: number;
}

export const findChampionWithSplashArtScoreCalculation: FindChampionWithSplashArtScoreCalculation[] = [
    {
        secondMin: 15,
        pixelateValueSplash: 90,
        pixelateValueLoading: 40,
        score: 4,
    },
    {
        secondMin: 10,
        pixelateValueSplash: 75,
        pixelateValueLoading: 30,
        score: 3,
    },
    {
        secondMin: 5,
        pixelateValueSplash: 60,
        pixelateValueLoading: 20,
        score: 2,
    },
    {
        secondMin: 0,
        pixelateValueSplash: 45,
        pixelateValueLoading: 10,
        score: 1,
    },
    {
        secondMin: -1,
        pixelateValueSplash: 1,
        pixelateValueLoading: 1,
        score: 0,
    },
];
