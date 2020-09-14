const {URL} = require('url')
const fetch = require('node-fetch')
const {query} = require('./util/hasura') 

// const movies = require('../data/movies.json')

exports.handler = async () => {
    const { movies } = await query({
        query: `
        query {
            movies {
              id
              poster
              tagline
              title
            }
          }
           
        `
    })
    const api = new URL('https://www.omdbapi.com/')
    api.searchParams.set('apiKey', process.env.OMDB_API_KEY)
    const promises = movies.map(movie => {
        api.searchParams.set('i', movie.id)
        return fetch(api)
            .then(response => response.json())
            .then(data => {
                const scores = data.Ratings
                return {
                    ...movie,
                    scores,
                }
            })
        })
    // Await here and not before fetch(api) because we want to fetch all movies in parallele and not waiting
    // for each movie to be loaded
    const moviesWithRatings = await Promise.all(promises)

    return {
        statusCode: 200,
        body: JSON.stringify(moviesWithRatings)
    } 

}