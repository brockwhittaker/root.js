var Router = (function () {
    var funcs = {
        // enums to describe the types that a particular path segment can be:
        // - PATH: hardcoded segment such as /users/.
        // - VARIABLE: variable in path such as /:id/, where ID can be anything
        //             in the expression /[^\/]/.
        E: {
            PATH: 0,
            VARIABLE: 1,
            ALL: 2,
        },

        // this is a method for parsing a path into segments.
        // path: A string path of the hash component.
        // this returns an array of dictionaries that have the keys "type" and
        // "component".
        // in the case of a path, the component is the hardcoded path, whereas
        // in the case of a variable it is either the key for the segment (if it
        // is the defined route), or the value (if it is the accessed route).
        // Example:
        // route:    /users/:id => { type: 1, component: "id" }
        // accessed: /users/230 => { type: 0, component: "230" }
        parse: function (path) {
            // remove leading and trailing slashes.
            var _path = path.replace(/^\/|\/$/, "");

            // split the path by '/', map over and test whether the segments
            // are declarative variables or hardcoded.
            _path = _path.split(/\//).map(function (component) {
                var type;
                if (/^:/.test(component)) {
                    type = funcs.E.VARIABLE;
                } else if (/^\*/.test(component)) {
                    type = funcs.E.ALL;
                } else {
                    type = funcs.E.PATH;
                }

                return { type: type, component: component };
            });

            return _path;
        },

        // where route = stored route, path = current hash.
        // this will take two paths and compare them -- one being a base route
        // and the other being a user-accessed path.
        compare: function (route, path) {
            var map = {};

            var len = Math.max(path.length, route.length);

            for (var x = 0; x < len; x++) {
                // if the route exists and the type is a path (hardcoded), then
                // check if the path exists and is the same to continue.
                if (route[x] && route[x].type === funcs.E.PATH &&
                    path[x] && path[x].component === route[x].component) {
                    continue;
                // otherwise if the route exists and is a variable, check if the
                // path exists. If so, continue.
                } else if (route[x] && route[x].type === funcs.E.VARIABLE && path[x]) {
                    // if there is a variable in the route, then make a key of the
                    // route segment and a value of the user-accessed path's segment.
                    map[route[x].component.replace(/^:/, "")] = path[x].component;
                    continue;
                // otherwise, this user-accessed path is not going to work with
                // this route.
                } else if (route[x] && route[x].type === funcs.E.ALL && path[x]) {
                    // if the * is not at the end of the route, it is just a
                    // segment * (similar to :id, but without variable capture).
                    // however if it is at the end of a route, it will capture
                    // up the rest of the string.
                    if (x < route.length - 1) {
                        // just check for any valid match.
                        continue;
                    } else {
                        map.__ALL = path.slice(x).map(function (o) {
                            return o.component;
                        }).join("/");
                        break;
                    }
                } else {
                    return false;
                }
            }

            return map;
        },

        run_middleware: function (data, middleware, callback) {
            var counter = 0;

            var run = function () {
                if (counter === middleware.length) {
                    callback();
                } else {
                    counter++;
                    middleware[counter - 1](data, run);
                }
            };

            run();
        }
    };

    var Router = function () {
        this.routes = [];
        this.middleware = [];

        // add with `addEventListener` to not disrupt other possible events bound
        // to `onhashchange`.
        window.addEventListener("hashchange", (function (e) {
            // the `window.location.hash` isn't actually the hash necessarily currently
            // in the browser. This happens when you change the hash multiple times
            // successively. To truly capture the state of the hashchange, we need to
            // grab the `e.newURL` property.
            var hash = e.newURL.split(/#/).pop();

            var path = funcs.parse(hash);

            // iterate through each of the routes to find a match.
            for (var x = 0; x < this.routes.length; x++) {
                // check if the route is valid.
                // this also will return a map of valid key/value pairs.
                var map = funcs.compare(this.routes[x].route, path);
                if (map) {
                    // set map inside the hashchange event to deliver in the callback.
                    e.params = map;
                    e.hash = hash;

                    // if there is an ending `__ALL` segment, we should record it
                    // in the `endHash` method.
                    if (e.params.__ALL) {
                        e.endHash = e.params.__ALL;
                        delete e.params.__ALL;
                    }

                    funcs.run_middleware(e, this.middleware, (function () {
                        // transmit original event and `this` arg.
                        this.routes[x].callback.call(this, e);
                    }).bind(this));

                    return true;
                }
            }
            return false;
        }).bind(this));
    };

    Router.prototype = {
        // allow for users to access the parse function to parse on their own.
        parse: funcs.parse,
        // set a new route that runs a particular callback when successfully hit.
        add: function (route, callback) {
            this.routes.push({
                route: funcs.parse(route),
                callback: callback
            });
        },
        use: function (callback) {
            this.middleware.push(callback);
        },
    };

    return Router;
}());
