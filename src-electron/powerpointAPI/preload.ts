import { ipcRenderer } from 'electron';
import type {
  ActivationOutcome,
  ActivationRequest,
  PowerPointAPI,
} from '@/../common/PowerPointAPI';

const api: PowerPointAPI = {
  onActivationRequest: (callback) => {
    ipcRenderer.on(
      'powerpoint:activationRequest',
      (_event, request: ActivationRequest) => callback(request),
    );
  },
  reportActivationResult: (outcome: ActivationOutcome) => {
    ipcRenderer.send('powerpoint:activationResult', outcome);
  },
};

export default api;
