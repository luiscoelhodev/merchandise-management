import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CustomMessages from '../CustomMessages'

export default class StoreValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    roles: schema
      .array([rules.minLength(1)])
      .members(schema.string({ trim: true }, [rules.exists({ table: 'roles', column: 'name' })])),
  })
}
