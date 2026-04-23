const key = '144d4300';

let page = 1;
let lastSearch = "";
let selectedType = "";
let total = 0;
let loading = false;

// simple helper
// api sometimes sends empty or N/A
// if data is bad, return fallback text
function fix(x, fallback) {
    if (!x || x === "N/A") {
        return fallback;
    }
    return x;
}

// main search function
// reset=true means new search
// reset=false means keep going for scroll
async function searchMovie(reset = true) {
    let input = document.getElementById("movieInput");
    let type = document.getElementById("typeFilter");
    let result = document.getElementById("result");
    let status = document.getElementById("status");

    // if this is a new search, reset old values
    if (reset) {
        lastSearch = input.value.trim();
        selectedType = type.value;
        page = 1;
        total = 0;
        result.innerHTML = "";
    }

    // basic empty control
    if (lastSearch === "") {
        status.textContent = "Please enter a movie name.";
        return;
    }

    // stop if request is still working
    if (loading) return;

    loading = true;
    status.textContent = "Searching...";

    // build url for search
    // page is important because api gives only 10 result per page
    let url = `https://www.omdbapi.com/?apikey=${key}&s=${encodeURIComponent(lastSearch)}&page=${page}`;

    // add filter if user selected movie or series
    if (selectedType !== "") {
        url += `&type=${selectedType}`;
    }

    try {
        let res = await fetch(url);
        let data = await res.json();

        // if api says false
        // first page means nothing found
        // other pages means no more result
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

        // total result count from api
        total = Number(data.totalResults);

        // show cards on page
        await showMovies(data.Search, result);

        let countNow = result.children.length;

        // update small status text
        if (countNow < total) {
            status.textContent = "Scroll down for more...";
        } else {
            status.textContent = "All results loaded.";
        }

        // save last search
        localStorage.setItem("lastMovie", lastSearch);
    } catch (e) {
        status.textContent = "Error while fetching data.";
        console.log(e);
    }

    loading = false;
}

// make movie cards
// for every search item, get extra detail with imdb id
async function showMovies(arr, place) {
    for (let one of arr) {
        try {
            let res = await fetch(`https://www.omdbapi.com/?apikey=${key}&i=${one.imdbID}`);
            let info = await res.json();

            let card = document.createElement("div");
            card.className = "movie-card";

            let img = document.createElement("img");

            // first try normal poster
            img.src = info.Poster;

            // if image is broken or poster is missing
            // put simple placeholder image
            img.onerror = function () {
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

// infinite scroll part
// when user gets near bottom, load next page
window.addEventListener("scroll", async function () {
    let result = document.getElementById("result");
    let status = document.getElementById("status");

    if (loading) return;
    if (lastSearch === "") return;

    let countNow = result.children.length;

    // stop if all results already loaded
    if (countNow >= total) return;

    let top = window.scrollY;
    let win = window.innerHeight;
    let full = document.documentElement.scrollHeight;

    // 200px before bottom, load next results
    if (top + win >= full - 200) {
        page++;
        status.textContent = "Loading more...";
        await searchMovie(false);
    }
});

// search button click
document.getElementById("searchBtn").addEventListener("click", function () {
    searchMovie(true);
});

// enter key search
document.getElementById("movieInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchMovie(true);
    }
});

// when page opens, load last search from local storage
window.addEventListener("load", function () {
    let old = localStorage.getItem("lastMovie");

    if (old) {
        document.getElementById("movieInput").value = old;
        searchMovie(true);
    }
});