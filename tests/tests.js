let log = console.table;

let router = new Router();

window.location.hash = "apple";
window.location.hash = "orange";
window.location.hash = "";
window.location.hash = "city/Berkeley";
window.location.hash = "book/Harry Potter/JK Rowling/Portland";
window.location.hash = "settings";
window.location.hash = "settings/organization-settings";
window.location.hash = "narrow/stream";
window.location.hash = "narrow/does/something/cool";
window.location.hash = "narrow/a/b";
window.location.hash = "narrow/a";

router.use((e, next) => {
    console.log("MIDDLEWARE", e.params, e.hash, e.endHash);
    next();
});

router.add("apple", () => {
    console.log("Route 'apple' successfully reached!");
});

router.add("city/:city", (e) => {
    console.log("Route 'city' successfully reached!");
});

router.add("book/:book/:author/:city", (e) => {
    let { book, author, city } = e.params;
    console.log(`Book ${book} by ${author} was found in ${city}.`);
});

router.add("settings", () => {
    console.log("Route 'settings' successfully reached!");
});

router.add("settings/:setting", (e) => {
    console.log(`Route 'settings/${e.params.setting}' successfully reached!`);
});

router.add("/", (e) => {
    console.log(`Page root found!`);
});

router.add(":id", (e) => {
    console.log(`Book with id '${e.params.id}' found.`);
});

router.add("/narrow/:action/something/*", (e) => {
    let { action } = e.params;
    console.log(`You reached a narrow that ${action} something __${e.params.__ALL}__.`);
});

router.add("/narrow/*/*", (e) => {
    console.log("two slashes", e.params, e.hash);
});

router.add("/narrow/*", (e) => {
    console.log(e.params, e.hash);
});
