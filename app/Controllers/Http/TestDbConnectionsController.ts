import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class TestDbConnectionsController {
  public async test({ response }: HttpContextContract) {
    await Database.report().then(({ health }) => {
      const { healthy, message } = health
      console.log(health)
      if (healthy) {
        return response.ok({ message })
      }
      return response.status(500).json({ message })
    })
  }
}
