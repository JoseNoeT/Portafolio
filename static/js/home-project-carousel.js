document.addEventListener("DOMContentLoaded", function () {
    const viewport = document.querySelector("[data-home-project-carousel]");

    if (!viewport) return;

    const track = viewport.querySelector(".home-project-track");
    const previousButton = viewport.querySelector("[data-carousel-prev]");
    const nextButton = viewport.querySelector("[data-carousel-next]");

    if (!track) return;

    const cards = Array.from(
        track.querySelectorAll(".feature-card")
    );

    if (!cards.length) return;

    function getStep() {
        if (cards.length < 2) {
            return cards[0].getBoundingClientRect().width;
        }

        return (
            cards[1].offsetLeft -
            cards[0].offsetLeft
        );
    }

    function updateControls() {
        const maxScroll =
            track.scrollWidth -
            track.clientWidth;

        const tolerance = 4;

        if (previousButton) {
            previousButton.disabled =
                track.scrollLeft <= tolerance;
        }

        if (nextButton) {
            nextButton.disabled =
                track.scrollLeft >=
                maxScroll - tolerance;
        }
    }

    function move(direction) {
        track.scrollBy({
            left: getStep() * direction,
            behavior: "smooth"
        });
    }

    if (previousButton) {
        previousButton.addEventListener(
            "click",
            function () {
                move(-1);
            }
        );
    }

    if (nextButton) {
        nextButton.addEventListener(
            "click",
            function () {
                move(1);
            }
        );
    }

    track.addEventListener(
        "scroll",
        updateControls,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        updateControls
    );

    updateControls();
});