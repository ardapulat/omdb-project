async function request(params) {
    const url = new URL(window.AppConfig.OMDB_API_URL);
    url.searchParams.set("apikey", window.AppConfig.OMDB_API_KEY);

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`OMDb request failed with HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === "False") {
        return {
            ok: false,
            error: data.Error || "No results found.",
            movies: [],
            totalResults: 0
        };
    }

    return {
        ok: true,
        movies: data.Search || [],
        totalResults: Number(data.totalResults || 0)
    };
}

function searchMovies({ query, type, page }) {
    return request({
        s: query,
        type,
        page: String(page)
    });
}

async function getMovieDetails(imdbID) {
    const url = new URL(window.AppConfig.OMDB_API_URL);
    url.searchParams.set("apikey", window.AppConfig.OMDB_API_KEY);
    url.searchParams.set("i", imdbID);
    url.searchParams.set("plot", "short");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`OMDb details request failed with HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === "False") {
        throw new Error(data.Error || "Movie details not found.");
    }

    return data;
}

window.OmdbApi = {
    searchMovies,
    getMovieDetails
};
