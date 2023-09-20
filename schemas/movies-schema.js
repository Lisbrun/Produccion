const z = require('zod') // Importamos la libreria Zod

const MovieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required.'
  }),
  year: z.number().int().min(1900).max(2024),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5).default(5.5),
  director: z.string().min(5).max(50),
  poster: z.string().url({ message: 'Poster must be a valid URL' }),
  genre: z.array(
    z.enum([
      'Action',
      'Adventure',
      'Crime',
      'Comedy',
      'Drama',
      'Fantasy',
      'Horror',
      'Thriller',
      'Sci-Fi'
    ]),
    {
      required_error: 'Movie genre is required.',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovie(object) {
  return MovieSchema.safeParse(object) // maneja la expresion y no es necesario el try catch
}
function validatePartial(object) {
  return MovieSchema.partial().safeParse(object)
}

module.exports = { validateMovie, validatePartial }
