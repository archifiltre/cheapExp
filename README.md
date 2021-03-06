# cheapExp

## Contributing

### Launching the app

First install the dependencies

```bash
yarn
```

Then build the project

```bash
yarn buildDev
```
or
```bash
yarn watchBuildDev
```

Then launch the application

```bash
yarn electron
```

### Pull requests

If you want to contribute, you must respect our linter specs. You can run `yarn lint` for compliance test.

You are welcome to open pull requests to add features to the project.


### Building/releasing the app.

First, build the app in production mode

```bash
yarn buildProd
```

Then you can package the app for the right platform :

```bash
yarn windows
yarn mac
```
