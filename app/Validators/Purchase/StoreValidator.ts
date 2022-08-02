import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CustomMessages from '../CustomMessages'

export default class StoreValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    cart_id: schema.number([rules.exists({ table: 'carts', column: 'id' }), rules.unsigned()]),
  })
}
