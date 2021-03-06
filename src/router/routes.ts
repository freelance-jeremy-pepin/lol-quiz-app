import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/IndexPage.vue') },
        ],
    },

    {
        path: '/quiz/item-name',
        component: () => import('layouts/QuizLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Quiz/ItemNameQuizPage.vue') },
        ],
        props: true,
    },

    {
        path: '/quiz/item-price',
        component: () => import('layouts/QuizLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Quiz/ItemPriceQuizPage.vue') },
        ],
        props: true,
    },

    {
        path: '/quiz/champion-image',
        component: () => import('layouts/QuizLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Quiz/ChampionImageQuizPage.vue') },
        ],
        props: true,
    },

    {
        path: '/quiz/champion-spell',
        component: () => import('layouts/QuizLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Quiz/ChampionSpellQuizPage.vue') },
        ],
        props: true,
    },

    {
        path: '/quiz/rune-name',
        component: () => import('layouts/QuizLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Quiz/RuneNameQuizPage.vue') },
        ],
        props: true,
    },

    {
        path: '/quiz/champion-lore',
        component: () => import('layouts/QuizLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Quiz/ChampionLoreQuizPage.vue') },
        ],
        props: true,
    },

    {
        path: '/room/:id',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Room/RoomPage.vue') },
        ],
    },

    {
        path: '/single-player',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/SinglePlayerPage.vue') },
        ],
    },

    {
        path: '/rooms',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Room/RoomsPage.vue') },
        ],
    },

    {
        path: '/collection/items',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Collections/ItemsCollectionPage.vue') },
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '*',
        component: () => import('pages/Error404Page.vue'),
    },
];

export default routes;
