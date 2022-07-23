import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DogsController {
  public async index({ response }: HttpContextContract) {
    return response.ok({ message: `Returns all dogs.` })
  }

  public async store({ response }: HttpContextContract) {
    return response.ok({ message: `Stores a doggy (:` })
  }

  public async show({ response }: HttpContextContract) {
    return response.ok({ message: `Doggy with an ID` })
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
