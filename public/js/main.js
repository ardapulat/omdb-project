const elements = {
    input: document.getElementById("movieInput"),
    type: document.getElementById("typeFilter"),
    search: document.getElementById("searchBtn"),
    result: document.getElementById("result"),
    status: document.getElementById("status"),
    clear: document.getElementById("clearBtn"),
    sentinel: document.getElementById("sentinel")
};

const state = {
    query: "",
    type: "",
    page: 1,
    total: 0,
    loaded: 0,
    loading: false,
    finished: false
};

const DEFAULT_SEARCH = "batman";

function setStatus(message) {
    elements.status.textContent = message;
}

function updateClearButton() {
    elements.clear.hidden = !state.query && elements.result.children.length === 0;
}

function resetResults() {
    state.page = 1;
    state.total = 0;
    state.loaded = 0;
    state.finished = false;
    elements.result.innerHTML = "";
}

async function enrichMovies(movies) {
    const details = await Promise.allSettled(
        movies.map((movie) => window.OmdbApi.getMovieDetails(movie.imdbID))
    );

    return details.map((entry, index) => {
        if (entry.status === "fulfilled") {
            return entry.value;
        }

        return movies[index];
    });
}

async function runSearch({ reset = true } = {}) {
    if (state.loading) {
        return;
    }

    if (reset) {
        state.query = elements.input.value.trim();
        state.type = elements.type.value;
        resetResults();
    }

    if (!state.query) {
        window.MovieUi.renderEmpty(elements.result, "Please enter a movie name.");
        setStatus("Search text is required.");
        updateClearButton();
        return;
    }

    state.loading = true;
    setStatus(reset ? "Searching..." : "Loading more results...");

    try {
        const data = await window.OmdbApi.searchMovies({
            query: state.query,
            type: state.type,
            page: state.page
        });

        if (!data.ok) {
            if (state.page === 1) {
                window.MovieUi.renderEmpty(elements.result, data.error);
            }

            state.finished = true;
            setStatus(state.page === 1 ? data.error : "No more results.");
            return;
        }

        state.total = data.totalResults;
        const movies = await enrichMovies(data.movies);

        movies.forEach((movie) => {
            elements.result.appendChild(window.MovieUi.renderMovie(movie));
        });

        state.loaded = elements.result.querySelectorAll(".movie-card").length;
        state.finished = state.loaded >= state.total;

        window.SearchStorage.saveLastSearch({
            query: state.query,
            type: state.type
        });

        setStatus(
            state.finished
                ? `Showing all ${state.loaded} result(s).`
                : `Showing ${state.loaded} of ${state.total}. Scroll for more.`
        );
    } catch (error) {
        console.error(error);
        setStatus(`Could not fetch movie data: ${error.message}`);

        if (state.page === 1) {
            window.MovieUi.renderEmpty(
                elements.result,
                "Movie data could not be loaded. Try opening the page with localhost or check your internet connection."
            );
        }
    } finally {
        state.loading = false;
        updateClearButton();
    }
}

function loadMoreIfNeeded(entries) {
    const [entry] = entries;

    if (!entry.isIntersecting || state.loading || state.finished || !state.query) {
        return;
    }

    state.page += 1;
    runSearch({ reset: false });
}

function restoreLastSearch() {
    const saved = window.SearchStorage.loadLastSearch();

    elements.input.value = saved?.query || DEFAULT_SEARCH;
    elements.type.value = saved?.type || "";
    runSearch();
}

elements.search.addEventListener("click", () => {
    runSearch();
});

elements.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        runSearch();
    }
});

elements.clear.addEventListener("click", () => {
    elements.input.value = "";
    elements.type.value = "";
    state.query = "";
    resetResults();
    window.SearchStorage.clearLastSearch();
    window.MovieUi.renderEmpty(elements.result, "Enter a title to start searching.");
    setStatus("Search cleared.");
    updateClearButton();
});

const observer = new IntersectionObserver(loadMoreIfNeeded, {
    rootMargin: "300px"
});

observer.observe(elements.sentinel);
restoreLastSearch();
