const elementsToHide = ["nav", ".github-corner"];

export function isMobileApp() {
    return navigator.userAgent.match(/robbie-the-robot-app/i);
}

export function prepareIfApp() {
    if (isMobileApp()) {
        elementsToHide.forEach(_ => {
            document.querySelector(_).parentNode.removeChild(document.querySelector(_));
        });
    }
}