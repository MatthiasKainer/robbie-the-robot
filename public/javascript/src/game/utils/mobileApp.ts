const elementsToHide = ["nav", ".github-corner"];

export function prepareIfApp() {
    if (navigator.userAgent.match(/robbie-the-robot-app/i)) {
        elementsToHide.forEach(_ => {
            document.querySelector(_).parentNode.removeChild(document.querySelector(_));
        });
    }
}