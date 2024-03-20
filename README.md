# BuzzMaster

BuzzMaster is a user-friendly application for hosting quiz shows with physical input devices, such as PlayStation buzzers.

## Key Features

- **Buzzer Questions**: Participants compete to be the first to press the red buzzer and answer the question.
- **Quiz Questions**: Participants select one of four options within a given time frame.
- **Stopwatch Mode**: Tracks the time taken for each participant to press the red button.
- **Scoreboard**: Keeps track of points gained or lost throughout the quiz show.

## Installation

Download the installer from the latest release and follow the installation steps.

Please note that there might be a security warning due to the lack of code signing for the executables.
This is because obtaining a certificate for code signing can be prohibitively expensive.

## Troubleshooting

Playstation 2 Buzz devices are recognised as a malfunctioning USB-hub instead of a HID-Device on windows.
Follow these steps to update the driver manually:

1. Open the device-manager
2. Right-click the USB-Hub and select `update-driver`
3. Select `Search for driver software on the computer`
4. Select `Select from a list of device drivers on the computer`
   5.From the list, select the entry `USB Input Device` or `USB HID Device`

## Development

```sh
git clode https://github.com/marvin-wtt/BuzzMaster
cd buzzmaster
npm install
```

Run in development mode:

```sh
npm run dev
```

Build executable for production:

```sh
npm run build
```

## Contributing

Contributions are welcome! Feel free to submit pull requests with new features, bug fixes, or improvements.

## License

Please refer to the [LICENCE](LICENCE) file for licensing information.

## Credits

Icons designed by drawingfreddie
