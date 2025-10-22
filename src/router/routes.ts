import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/cast',
    component: () => import('layouts/CastLayout.vue'),
    children: [
      {
        path: '',
        name: 'cast',
        component: () => import('pages/cast/CastIndexPage.vue'),
      },
      {
        path: 'leaderboard',
        name: 'cast-leaderboard',
        component: () => import('pages/cast/LeaderboardCastPage.vue'),
      },
      {
        path: 'buzzer',
        name: 'cast-buzzer',
        component: () => import('pages/cast/BuzzerCastPage.vue'),
      },
      {
        path: 'quiz',
        name: 'cast-quiz',
        component: () => import('pages/cast/QuizCastPage.vue'),
      },
      {
        path: 'stopwatch',
        name: 'cast-stopwatch',
        component: () => import('pages/cast/StopwatchCastPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'leaderboard',
        name: 'leaderboard',
        component: () => import('pages/LeaderboardPage.vue'),
        meta: {
          title: 'leaderboard.title',
        },
      },
      {
        path: 'devices',
        name: 'devices',
        component: () => import('pages/DevicesPage.vue'),
        meta: {
          title: 'devices.title',
        },
      },
      {
        path: 'gameModes',
        children: [
          {
            path: '',
            component: () => import('pages/gameModes/GameModesIndexPage.vue'),
            meta: {
              title: 'gameMode.title',
            },
          },
          {
            path: 'buzzer',
            name: 'buzzer-game',
            component: () => import('pages/gameModes/BuzzerGamePage.vue'),
            meta: {
              title: 'gameMode.buzzer.title',
            },
          },
          {
            path: 'quiz',
            name: 'quiz-game',
            component: () => import('pages/gameModes/QuizGamePage.vue'),
            meta: {
              title: 'gameMode.quiz.title',
            },
          },
          {
            path: 'stopwatch',
            name: 'stopwatch-game',
            component: () => import('pages/gameModes/StopwatchGamePage.vue'),
            meta: {
              title: 'gameMode.stopwatch.title',
            },
          },
          {
            path: 'viewing-rate',
            name: 'viewing-rate-game',
            component: () => import('pages/gameModes/ViewingRateGamePage.vue'),
            meta: {
              title: 'gameMode.viewingRate.title',
            },
          },
          {
            path: 'pong',
            name: 'pong-game',
            component: () => import('pages/gameModes/ArcadePongGamePage.vue'),
            meta: {
              title: 'gameMode.pong.title',
            },
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
