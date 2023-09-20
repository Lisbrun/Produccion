const express = require('express')
const movies = require('./movies.json')
const { randomUUID } = require('node:crypto')
const { validateMovie, validatePartial } = require('./schemas/movies-schema')
const cors = require('cors')
const app = express()

app.disable('x-powered-by') // desabilitamos la cabecera X-Powered-By
const port = process.env.PORT ?? 1234

app.use(express.json()) // middleware para capturar el body de la request
app.use(
  cors({
    origin: (origin, callback) => { // funcion para validar el origen de la solicitud
      const ACCEPTED_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:1234',
        'http://localhost:1234/movies'
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      if (!origin) return callback(null, true)

      return callback(new Error('Not allowed by CORS'))
    }
  })
) // middleware para habilitar CORS (Cross-Origin Resource Sharing - pero selecciona todo los origenes *

app.get('/movies', (req, res) => {
  // const origin = req.headers.origin
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', '*')
  // }

  const { genre } = req.query // obtenemos el genero de los parametros

  if (genre) {
    const filterMovies = movies.filter(
      (movie) =>
        movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()) // buscamos el genero en los datos del JSON movie
    )
    if (filterMovies.length === 0) {
      return res.status(404).json({ message: 'genre not found' })
    } else {
      return res.json(filterMovies)
    }
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params // obtenemos el id de los parametros
  const movie = movies.find((movie) => movie.id === id) // buscamos el id en los datos del JSON movie
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const newMovie = {
    id: randomUUID(), // UUID v4
    ...req.body
  }
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params // obtenemos el id de los parametros
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'movie not found' })
  }
  movies.splice(movieIndex, 1)
  res.status(204).json({ message: 'movie deleted ' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartial(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params // obtenemos el id de los parametros
  const IndexMovie = movies.findIndex((movie) => movie.id === id) // buscamos el id en los datos del JSON movie

  if (IndexMovie === -1) {
    return res.status(404).json({ message: 'movie not found' })
  }

  const updateMovie = {
    ...movies[IndexMovie],
    ...result.data
  }

  movies[IndexMovie] = updateMovie

  return res.json(updateMovie)
})

// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin')
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', '*') // Permitir solo el origen de la solicitud
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE') // Permitir los métodos GET, POST, PATCH, DELETE
//     res.sendStatus(200) // Configurar el código de estado y enviar la respuesta
//   } else {
//     res.sendStatus(403) // Si el origen no está permitido, puedes devolver un código 403 Forbidden
//   }
// })

app.listen(port, () => {
  console.log(`server listening on port http://localhost:${port}`)
})
