import { ButtonMapping, BuzzerButton } from 'src/composables/buzzer/types';

/**
 * 20 mappings: 5 buttons x 4 buzzers
 * https://gist.github.com/Lewiscowles1986/eef220dac6f0549e4702393a7b9351f6
 */
export const buttonMapping: ButtonMapping[] = [
  {
    controller: 0,
    button: BuzzerButton.RED,
    byte: 2,
    mask: 0x01,
  },
  {
    controller: 0,
    button: BuzzerButton.YELLOW,
    byte: 2,
    mask: 0x02,
  },
  {
    controller: 0,
    button: BuzzerButton.GREEN,
    byte: 2,
    mask: 0x04,
  },
  {
    controller: 0,
    button: BuzzerButton.ORANGE,
    byte: 2,
    mask: 0x08,
  },
  {
    controller: 0,
    button: BuzzerButton.BLUE,
    byte: 2,
    mask: 0x10,
  },
  {
    controller: 1,
    button: BuzzerButton.RED,
    byte: 2,
    mask: 0x20,
  },
  {
    controller: 1,
    button: BuzzerButton.YELLOW,
    byte: 2,
    mask: 0x40,
  },
  {
    controller: 1,
    button: BuzzerButton.GREEN,
    byte: 2,
    mask: 0x80,
  },
  {
    controller: 1,
    button: BuzzerButton.ORANGE,
    byte: 3,
    mask: 0x01,
  },
  {
    controller: 1,
    button: BuzzerButton.BLUE,
    byte: 3,
    mask: 0x02,
  },
  {
    controller: 2,
    button: BuzzerButton.RED,
    byte: 3,
    mask: 0x04,
  },
  {
    controller: 2,
    button: BuzzerButton.YELLOW,
    byte: 3,
    mask: 0x08,
  },
  {
    controller: 2,
    button: BuzzerButton.GREEN,
    byte: 3,
    mask: 0x10,
  },
  {
    controller: 2,
    button: BuzzerButton.ORANGE,
    byte: 3,
    mask: 0x20,
  },
  {
    controller: 2,
    button: BuzzerButton.BLUE,
    byte: 3,
    mask: 0x40,
  },
  {
    controller: 3,
    button: BuzzerButton.RED,
    byte: 3,
    mask: 0x80,
  },
  {
    controller: 3,
    button: BuzzerButton.YELLOW,
    byte: 4,
    mask: 0x01,
  },
  {
    controller: 3,
    button: BuzzerButton.GREEN,
    byte: 4,
    mask: 0x02,
  },
  {
    controller: 3,
    button: BuzzerButton.ORANGE,
    byte: 4,
    mask: 0x04,
  },
  {
    controller: 3,
    button: BuzzerButton.BLUE,
    byte: 4,
    mask: 0x08,
  },
];
