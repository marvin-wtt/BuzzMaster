import PointsUpdateDialog from 'components/leaderboard/PointsUpdateDialog.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useLeaderboardStore } from 'stores/leaderboard-store';
import { LeaderboardEntry } from 'app/common/gameState/LeaderboardState';

export function useLeaderboardDialogs() {
  const quasar = useQuasar();
  const { t } = useI18n();
  const leaderboardStore = useLeaderboardStore();

  function showResetPoints() {
    quasar
      .dialog({
        title: t('leaderboard.reset.title'),
        message: t('leaderboard.reset.message'),
        ok: {
          label: t('leaderboard.reset.action.ok'),
          color: 'negative',
          rounded: true,
        },
        cancel: {
          label: t('leaderboard.reset.action.cancel'),
          color: 'primary',
          rounded: true,
          outline: true,
        },
      })
      .onOk(() => {
        leaderboardStore.resetPoints();
      });
  }

  function showUpdatePoints(entry: LeaderboardEntry) {
    quasar
      .dialog({
        component: PointsUpdateDialog,
        componentProps: {
          entry,
        },
      })
      .onOk((payload) => {
        leaderboardStore.updatePoints(entry.id, payload);
      });
  }

  return {
    showResetPoints,
    showUpdatePoints,
  };
}
