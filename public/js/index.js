const params = new URLSearchParams(window.location.search);
const currentCategory = params.get("category");

if (currentCategory) {
    const options = document.querySelectorAll(".filterOption");

    options.forEach(option => {
        const anchor = option.querySelector("a");
        const url = new URL(anchor.href);
        const linkCategory = url.searchParams.get("category");

        if (linkCategory === currentCategory) {
            option.classList.add("active-option");
        }
    });
}