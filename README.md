
## WACFLED

Or Web Assistant Connector for Led is an app I developed to simplify and customize my led lights.

Original project by Lehkda. SP108E_controller

It is currently under development, I'm not looking for anything fancy, just a simple and accessible control unlike the app that have Chinese controllers. To make it clear, frontend is not my specialty.

It is specifically developed for SP108E controllers, I am not sure if it can be used with other hexadecimal command controllers. At least it can be used as a base for similar projects.

## How to use commands?

Lehkda already has an pretty useful set of commands described [Here!](https://github.com/Lehkeda/SP108E_controller/blob/6fe9bed8b593c9bf5cbd25f9f8d585a5c7e32e26/README.md).
I have nothing to add other than to recommend using the commands from your controller app to better understand what you are doing. This is the main reason why I added an event viewer to the app, so you can understand what each byte is doing live.

This structure is basically the general rule:

| Start byte | Color/Garbage | Instruction byte | End byte |
|--|--|--|--|
| 38 | FF0000 | 2C | 83 |

Just try a change from the controller app and press the button to see the actual controller information.

## Dependencies

None. App is lightweight and ready to go.

## How to use?

Just deploy the app in your prefered machine.

The use is simple but unfortunately I programmed the menu in Spanish. I will add more languages for sure.

## What to expect in the future?

I will be working continuously on the development, mainly because I am a bit rusty and it has been a very entertaining and educational project.

So this is what I plan to do:
- Add a search for devices connected to the network to replace the ip input.
- Add more animations, especially breathing in color combinations.
- Visual tweaks, I'm updating my bootstrap.
## More info in the changelog
