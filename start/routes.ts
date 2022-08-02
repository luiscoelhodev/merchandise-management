/*
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// Public Routes

Route.post('/users', 'UsersController.store')
Route.post('/login', 'AuthController.login')
Route.get('/test_db_connections', 'TestDbConnectionsController.test')

// Authenticated Routes (Private)
Route.get('/test_auth', ({ response }: HttpContextContract) => {
  return response.ok({ message: 'You are authenticated.' })
}).middleware(['auth', 'is:admin,client,employee'])

Route.group(() => {
  Route.put('/:id', 'UsersController.update')
})
  .prefix('/users')
  .middleware(['auth', 'is:client'])

Route.group(() => {
  Route.resource('/products', 'ProductsController').apiOnly()
}).middleware(['auth', 'is:admin,employee'])

Route.group(() => {
  Route.resource('/categories', 'CategoriesController').apiOnly()
}).middleware(['auth', 'is:admin,employee'])

Route.group(() => {
  Route.resource('/cart', 'CartController').apiOnly()
}).middleware(['auth', 'is:client'])

Route.group(() => {
  Route.resource('/purchases', 'PurchasesController').only(['store', 'index', 'show'])
}).middleware(['auth', 'is:client'])

// Admin-only routes
Route.group(() => {
  Route.get('/', 'UsersController.index')
  Route.get('/:id', 'UsersController.show')
  Route.delete('/:id', 'UsersController.destroy')
})
  .prefix('/users')
  .middleware(['auth', 'is:admin'])

Route.post('users/access_allow', 'UsersController.AccessAllow').middleware(['auth', 'is:admin'])
