# BuzzMaster

BuzzMaster is a user-friendly application for hosting quiz shows with physical input devices, such as PlayStation buzzers.

## Key Features

### Buzzer Questions

Participants compete to be the first to press the red buzzer and answer the question.

### Quiz Questions

Participants select one of four options within a given time frame.

### Stopwatch Mode

Tracks the time taken for each participant to press the red button.

### Leaderboard

Keeps track of points gained or lost throughout the quiz show.
Points can be updated either directly after a question / game or manually in the leaderboard.
When choosing to update the points manually, either new points can be set or the current points can be updated using simple algebra.

### Energy Saving Notification

Shows a notification when a controller is about to go into energy saving mode.
The feature is available for a controller after the first button press.

## Installation

> [!Note]
> Please note that there might be a security warning when downloading and executing the installer due to the lack of code signing.
> This is because obtaining a certificate for code signing is prohibitively expensive.

Download the installer from the latest release and follow the installation steps.

Once the application is started, it will check for new versions. Once a new version is available, it will be installed on the next launch automatically.

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
