import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class HelloWorldsController {
  public async hello({ params }: HttpContextContract) {
    const { id } = params
    if (id) {
      return { message: 'Params was entered successfully!', id: id }
    }
    return { message: 'Hello World!' }
  }
}
