import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    return response.ok({ message: `Returns all users.` })
  }

  // public async create({}: HttpContextContract) {} -> Somente MVC

  public async store({ response }: HttpContextContract) {
    return response.ok({ message: `Stores a user in the database.` })
  }

  public async show({ response, params }: HttpContextContract) {
    const { id } = params
    return response.ok({ message: `Returns user with ID ${id}.` })
  }

  // public async edit({}: HttpContextContract) {} -> Somente MVC

  public async update({ response, params }: HttpContextContract) {
    return response.ok({ message: `Updates a user with ID ${params.id}.` })
  }

  public async destroy({ response, params }: HttpContextContract) {
    return response.ok({ message: `Deletes a user with ID ${params.id}.` })
  }
}
