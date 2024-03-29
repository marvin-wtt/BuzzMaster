import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'devices',
        component: () => import('pages/DevicesPage.vue'),
        meta: {
          title: 'devices.title',
        },
      },
      {
        path: 'questions',
        children: [
          {
            path: '',
            component: () => import('pages/questions/QuestionIndexPage.vue'),
            meta: {
              title: 'question.title',
            },
          },
          {
            path: 'buzzer',
            name: 'buzzer-question',
            component: () => import('pages/questions/BuzzerQuestionPage.vue'),
            meta: {
              title: 'question.buzzer.title',
            },
          },
          {
            path: 'quiz',
            name: 'quiz-question',
            component: () => import('pages/questions/QuizQuestionPage.vue'),
            meta: {
              title: 'question.quiz.title',
            },
          },
          {
            path: 'stopwatch',
            name: 'stopwatch-question',
            component: () =>
              import('pages/questions/StopwatchQuestionPage.vue'),
            meta: {
              title: 'question.stopwatch.title',
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
