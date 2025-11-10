# Deutsch im Blick App

An unofficial Electron app version of the Deutsch im Blick open textbook!

## Description

This is a German language-learning application based off [the Deutsch im Blick open textbook by the University of Texas at Austin](https://coerll.utexas.edu/dib/credits.php). This project is not affiliated with them; it is being made under accordance with their Open License (more info [here](https://coerll.utexas.edu/coerll/)).

The app provides an interactive desktop experience for learning German, featuring exercises and content from the Deutsch im Blick curriculum in a modern, user-friendly interface.

## Getting Started

### Dependencies

* Node.js (version 18 or higher)
* npm (comes with Node.js)
* Windows 10/11, macOS, or Linux

### Installing

1. Clone the repository
```
git clone https://github.com/habbie321/deutsch-im-blick.git
cd deutsch-im-blick
```
2. Install all dependencies (this installs for the root, Electron app, and React app)
```
npm run install-all
```

### Executing program

For development:
```
code blocks for commands
```

## Help

Common issues:

If you encounter module version errors:
```
cd electron-app
npm rebuild
```

If the app fails to start:
```
npm run install-all
```

## Authors

Contributors names and contact info

[habbie321](https://github.com/habbie321)

## Version History

* 0.1.0
    * Development preview

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

* University of Texas at Austin for creating the original Deutsch im Blick open textbook
* README.md made using DomPizzie's [template](https://gist.github.com/DomPizzie/7a5ff55ffa9081f2de27c315f5018afc)
* Built with Electron, React, and Material-UI