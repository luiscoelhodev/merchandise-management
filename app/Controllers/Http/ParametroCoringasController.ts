import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ParametroCoringasController {
  public async coringa({ params }: HttpContextContract) {
    const parametroCoringaArray = params['*']
    const paramFixo = params.paramFixo
    return { message: parametroCoringaArray, Fixo: paramFixo }
  }
}
