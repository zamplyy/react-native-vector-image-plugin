# react-native-vector-image-plugin

Config plugin to auto configure `react-native-vector-image` when the native code is generated (`expo prebuild`).

## Expo installation

> Tested against Expo SDK 45

> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).
> First install the package with yarn, npm, or [`expo install`](https://docs.expo.io/workflow/expo-cli/#expo-install).

```sh
expo install react-native-vector-image @klarna/react-native-vector-drawable
expo install @zamplyy/react-native-vector-image-plugin
```

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": ["@zamplyy/react-native-vector-image-plugin"]
  }
}
```

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

#### Example

```json
{
  "expo": {
    "plugins": [
      [
        "@zamplyy/react-native-vector-image-plugin",
        {
          "isMonorepo": false // default false (if enabled will look for node_modules two folders above regular),
          "customMetroConfigFile": "name of custom mentro config file (default is metro.config.js)",
          "resetCache": false // Tell CLI to reset metro cache when bundling svgs (default false),
          "customEntryFile": "name of custom entry file" // Default is index.js
        }
      ]
    ]
  }
}
```

# Contributing

Contributions are very welcome!
