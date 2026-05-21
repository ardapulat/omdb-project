# Movie Search App

This is a web-based app allowing its users to find movies or series by name.

The project consists of:
- HTML
- CSS
- JavaScript

## Features

- Search movies and series by name
- Filter search by type (movies/series/all)
- Show movie details such as:
    - Title
    - Year
    - Genres
    - Directors
    - Poster 
- Infinite scroll for more movies/series
- Store last searched movie with localStorage
- Show fallback text in case of missing info
- Show placeholder image in case of missing poster 

## API

This app uses OMDb API to make calls for fetching data from another resource.

- Search (`s=`) is used to show search results
- ID (`i=`) is used to get more details

## Implementation

- Cards for movies are generated dynamically with JavaScript
- Results are paginated (one page = 10 results)
- Infinite scroll is added based on scroll
- API is called again to fetch more detailed info 
- Some error handling for API and missing data

## Data storage

- Last searched movie is saved in localStorage 
- Previous search is automatically retrieved after reopening website

## Objective

The objective of this project was to get hands-on experience in:
- Making calls to APIs 
- Asynchronous programming (fetch/async/await)
- Dynamically changing DOM elements
- Enhance user experience
