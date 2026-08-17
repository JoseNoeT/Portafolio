document.addEventListener("DOMContentLoaded", function () {
    const viewport = document.querySelector(".home-project-carousel");
    const track = document.querySelector(".home-project-track");

    if (!viewport || !track) return;

    const originals = Array.from(
        track.querySelectorAll(".feature-card")
    );

    if (originals.length < 2) return;

    originals.forEach(function (card) {
        const clone = card.cloneNode(true);

        clone.classList.add("carousel-clone");
        clone.setAttribute("aria-hidden", "true");

        track.appendChild(clone);
    });

    const firstOriginal = originals[0];
    const firstClone = track.querySelector(".carousel-clone");

    let position = 0;
    let previousTime = null;
    let paused = false;

    const speed = 28;

    function loopDistance() {
        return (
            firstClone.offsetLeft -
            firstOriginal.offsetLeft
        );
    }

    function animate(time) {
        if (previousTime === null) {
            previousTime = time;
        }

        const delta = Math.min(
            time - previousTime,
            40
        ) / 1000;

        previousTime = time;

        if (!paused) {
            position += speed * delta;

            const distance = loopDistance();

            if (
                distance > 0 &&
                position >= distance
            ) {
                position -= distance;
            }

            track.style.transform =
                "translate3d(" +
                (-position) +
                "px, 0, 0)";
        }

        requestAnimationFrame(animate);
    }

    viewport.addEventListener(
        "mouseenter",
        function () {
            paused = true;
        }
    );

    viewport.addEventListener(
        "mouseleave",
        function () {
            paused = false;
            previousTime = null;
        }
    );

    requestAnimationFrame(animate);
});
