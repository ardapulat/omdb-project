const key = '144d4300';

let page = 1;
let lastSearch = "";
let selectedType = "";
let total = 0;
let loading = false;

function fix(x, fallback) {
    if (!x || x === "N/A") {
        return fallback;
    }
    return x;
}

async function searchMovie(reset = true) {
    let input = document.getElementById("movieInput");
    let type = document.getElementById("typeFilter");
    let result = document.getElementById("result");
    let status = document.getElementById("status");

    if (reset) {
        lastSearch = input.value.trim();
        selectedType = type.value;
        page = 1;
        total = 0;
        result.innerHTML = "";
    }

    if (lastSearch === "") {
        status.textContent = "Please enter a movie name.";
        return;
    }

    if (loading) return;

    loading = true;
    status.textContent = "Searching...";

    let url = `https://www.omdbapi.com/?apikey=${key}&s=${encodeURIComponent(lastSearch)}&page=${page}`;

    if (selectedType !== "") {
        url += `&type=${selectedType}`;
    }

    try {
        let res = await fetch(url);
        let data = await res.json();

        if (data.Response === "False") {
            if (page === 1) {
                result.innerHTML = "";
                status.textContent = "No results found. Try a different keyword.";
            } else {
                status.textContent = "No more results.";
            }

            loading = false;
            return;
        }

        total = Number(data.totalResults);

        await showMovies(data.Search, result);

        let countNow = result.children.length;

        if (countNow < total) {
            status.textContent = "Scroll down for more...";
        } else {
            status.textContent = "All results loaded.";
        }

        localStorage.setItem("lastMovie", lastSearch);
    } catch (e) {
        status.textContent = "Error while fetching data.";
        console.log(e);
    }

    loading = false;
}

async function showMovies(arr, place) {
    for (let one of arr) {
        try {
            let res = await fetch(`https://www.omdbapi.com/?apikey=${key}&i=${one.imdbID}`);
            let info = await res.json();

            let card = document.createElement("div");
            card.className = "movie-card";

            let img = document.createElement("img");

            img.src = info.Poster;

            img.onerror = function () {
                this.onerror = null;
                this.src = "https://via.placeholder.com/100x150";
            };

            let right = document.createElement("div");
            right.className = "movie-info";

            let title = document.createElement("h3");
            title.textContent = fix(info.Title, "No title");

            let year = document.createElement("p");
            year.textContent = "Year: " + fix(info.Year, "Unknown");

            let genre = document.createElement("p");
            genre.textContent = "Genre: " + fix(info.Genre, "Not specified");

            let director = document.createElement("p");
            director.textContent = "Director: " + fix(info.Director, "Unknown");

            right.appendChild(title);
            right.appendChild(year);
            right.appendChild(genre);
            right.appendChild(director);

            card.appendChild(img);
            card.appendChild(right);

            place.appendChild(card);
        } catch (e) {
            console.log("detail error", e);
        }
    }
}

window.addEventListener("scroll", async function () {
    let result = document.getElementById("result");
    let status = document.getElementById("status");

    if (loading) return;
    if (lastSearch === "") return;

    let countNow = result.children.length;

    if (countNow >= total) return;

    let top = window.scrollY;
    let win = window.innerHeight;
    let full = document.documentElement.scrollHeight;

    if (top + win >= full - 200) {
        page++;
        status.textContent = "Loading more...";
        await searchMovie(false);
    }
});

document.getElementById("searchBtn").addEventListener("click", function () {
    searchMovie(true);
});

document.getElementById("movieInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchMovie(true);
    }
});

window.addEventListener("load", function () {
    let old = localStorage.getItem("lastMovie");

    if (old) {
        document.getElementById("movieInput").value = old;
        searchMovie(true);
    }
});