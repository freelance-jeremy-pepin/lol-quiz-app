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
    ItemName = 'item-name',
    ItemPrice = 'item-price',
    ChampionSplashArt = 'champion-splash-art',
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
    },

    {
        id: '3',
        name: `Find champion's splash-art`,
        internalName: QuizListInternalName.ChampionSplashArt,
        canSkipQuestion: true,
        onlyOneTry: false,
        scoreBasedOnQuestionNumber: false,
        winnerHasTheLowestScore: false,
        answersAreOnlyNumber: false,
    },
];

export interface FindChampionWithSplashArtScoreCalculation {
    secondMax: number;
    pixelateValue: number;
    score: number;
}

export const findChampionWithSplashArtScoreCalculation: FindChampionWithSplashArtScoreCalculation[] = [
    {
        secondMax: 5,
        pixelateValue: 90,
        score: 4,
    },
    {
        secondMax: 10,
        pixelateValue: 75,
        score: 3,
    },
    {
        secondMax: 15,
        pixelateValue: 60,
        score: 2,
    },
    {
        secondMax: 20,
        pixelateValue: 45,
        score: 1,
    },
    {
        secondMax: 21,
        pixelateValue: 1,
        score: 0,
    },
];
