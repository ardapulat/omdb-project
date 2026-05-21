const FALLBACK_POSTER = "https://via.placeholder.com/220x330?text=No+Poster";

function valueOrFallback(value, fallback) {
    return value && value !== "N/A" ? value : fallback;
}

function createMeta(label, value) {
    const item = document.createElement("p");
    const labelNode = document.createElement("strong");
    labelNode.textContent = `${label}: `;
    item.append(labelNode, valueOrFallback(value, "Unknown"));
    return item;
}

function renderMovie(movie) {
    const card = document.createElement("article");
    card.className = "movie-card";

    const poster = document.createElement("img");
    poster.alt = `${valueOrFallback(movie.Title, "Movie")} poster`;
    poster.loading = "lazy";
    poster.src = valueOrFallback(movie.Poster, FALLBACK_POSTER);
    poster.onerror = () => {
        poster.src = FALLBACK_POSTER;
    };

    const body = document.createElement("div");
    body.className = "movie-info";

    const title = document.createElement("h2");
    title.textContent = valueOrFallback(movie.Title, "No title");

    body.append(
        title,
        createMeta("Year", movie.Year),
        createMeta("Type", movie.Type),
        createMeta("Genre", movie.Genre),
        createMeta("Director", movie.Director),
        createMeta("IMDB", movie.imdbID)
    );

    card.append(poster, body);
    return card;
}

function renderEmpty(container, message) {
    container.innerHTML = "";

    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = message;
    container.appendChild(empty);
}

window.MovieUi = {
    renderMovie,
    renderEmpty
};
