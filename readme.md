# root.js

**root.js** is a routing framework for client side hashes. This library should work similarly to routing in systems like express.js, however it is not guaranteed to mirror it.

The **root.js** library is 1.2kb minified, and 0.6kb gzipped!

## Features

There are a few simple features in the routing system:

1. variables: Declare a segment variable with a colon like `/:id/`. Matching user-accessed routes will have maps with their key/value pairs.
2. any: Declare a segment to be anything by using an asterisk like `/*/`. All routes that contain any segment in the position of the asterisk will match.
3. end-any: Declare the end segment as an asterisk and it will match beyond the forward slashes to the end of the path. In this case `/*` will match both `/books` and `/books/about/stuff`, and capture the end segments.

## Getting Started

Create a new `Router` instance simply with the `new` keyword, and add a basic path to get the weather.

```js
var router = new Router();

router.add("/weather", () => {
    console.log(`This user is trying to access '/weather'.`);
});

// PATHS:
// /weather
```

However in this instance we may want a user to be able to type in something like `weather/Berkeley` where we can capture the city name. For this we'll use a variable.

```js
router.add("/weather/:city", (e) => {
    let { city } = e.params;
    console.log(`This user is trying to get the weather in ${city}.`);
});

// PATHS:
// /weather/Berkeley
// /weather/San Francisco
// /weather/Palo Alto
```

If we aren't interested in capturing the video, we can also just use a `*` segment to match anything in a path segment.

```js
router.add("/weather/*/:city", (e) => {
    let { city } = e.params;
    console.log(`This user is trying to get the weather in ${city}.`);
});

// PATHS:
// /weather/test/Berkeley
// /weather/0813472309/San Francisco
// /weather/_/Palo Alto
```

You can also put a `*` at the end of a segment to capture the rest of the path after that segment.

```js
// /weather/Berkeley/01012012/01012016
router.add("/weather/:city/*", (e) => {
    let { city } = e.params;
    let { endHash } = e;

    console.log(`This user is trying to get the weather in ${city}.`);
    console.log({ endHash }); // /01012012/01012016.

    // PATHS:
    // /weather/Berkeley/a => { city: "Berkeley", endHash: "/a" }
    // /weather/Berkeley/a/b/c/d/e/ => { city: "Berkeley", endHash: "/b/c/d/e" }
});
```
