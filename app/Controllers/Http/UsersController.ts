import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Address from 'App/Models/Address'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    return response.ok({ message: `Returns all users.` })
  }

  // public async create({}: HttpContextContract) {} -> Somente MVC

  public async store({ request, response }: HttpContextContract) {
    const userBody = request.only(['name', 'cpf', 'email', 'password'])
    const addressBody = request.only([
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    const user = new User()
    const trx = Database.transaction()

    try {
      user.fill(userBody)
      user.useTransaction(await trx)
      await user.save()
      const clientRole = await Role.findBy('name', 'client')
      if (clientRole) await user.related('roles').attach([clientRole.id])
    } catch (error) {
      ;(await trx).rollback()
      return response.badRequest({
        message: 'Error in creating user',
        originalErrorMessage: error.message,
      })
    }

    try {
      await user.related('addresses').create(addressBody)
    } catch (error) {
      ;(await trx).rollback()
      return response.badRequest({
        message: 'Error in creating address',
        originalErrorMessage: error.message,
      })
    }

    ;(await trx).commit()

    let userFound
    try {
      userFound = await User.query().where('id', user.id).preload('roles').preload('addresses')
    } catch (error) {
      ;(await trx).rollback()
      return response.badRequest({
        message: 'Error in finding user',
        originalErrorMessage: error.message,
      })
    }
    return response.ok({ userFound })
  }

  public async show({ response, params }: HttpContextContract) {
    const { id } = params
    return response.ok({ message: `Returns user with ID ${id}.` })
  }

  // public async edit({}: HttpContextContract) {} -> Somente MVC

  public async update({ request, response, params }: HttpContextContract) {
    const userSecureId = params.id
    const userBody = request.only(['name', 'cpf', 'email', 'password'])
    const addressBody = request.only([
      'addressId',
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    let user = new User()
    const trx = Database.transaction()

    try {
      user = await User.findByOrFail('secure_id', userSecureId)
      user.useTransaction(await trx)
      await user.merge(userBody).save()
    } catch (error) {
      ;(await trx).rollback()
      return response.badRequest({
        message: 'Error in updating user',
        originalErrorMessage: error.message,
      })
    }

    try {
      const addressUpdated = await Address.findByOrFail('id', addressBody.addressId)
      addressUpdated.useTransaction(await trx)
      delete addressBody.addressId
      await addressUpdated.merge(addressBody).save()
    } catch (error) {
      ;(await trx).rollback()
      return response.badRequest({
        message: 'Error in updating address',
        originalErrorMessage: error.message,
      })
    }

    ;(await trx).commit()

    let userFound
    try {
      userFound = await User.query().where('id', user.id).preload('roles').preload('addresses')
    } catch (error) {
      ;(await trx).rollback()
      return response.badRequest({
        message: 'Error in finding user',
        originalErrorMessage: error.message,
      })
    }
    return response.ok({ userFound })
  }

  public async destroy({ response, params }: HttpContextContract) {
    return response.ok({ message: `Deletes a user with ID ${params.id}.` })
  }
}
