import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CustomMessages from '../CustomMessages'

export default class UpdateValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    addOneItem: schema.boolean.optional([]),
    removeOneItem: schema.boolean.optional([]),
    setItemQuantity: schema.number.optional([
      rules.requiredIfNotExistsAll(['addOneItem', 'removeOneItem']),
    ]),
  })
}
