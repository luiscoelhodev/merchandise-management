/* eslint-disable @typescript-eslint/naming-convention */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Address from 'App/Models/Address'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { sendImgToS3AWS } from 'App/Services/sendImgToS3AWS'
import { sendMail } from 'App/Services/sendMail'
import AccessAllowValidator from 'App/Validators/User/AccessAllowValidator'
import StoreValidator from 'App/Validators/User/StoreValidator'
import UpdateValidator from 'App/Validators/User/UpdateValidator'

export default class UsersController {
  public async index({ response, request }: HttpContextContract) {
    const { page, itemsPerPage, noPagination, ...inputs } = request.qs()

    if (noPagination) {
      const usersWithoutPagination = await User.query()
        .preload('addresses')
        .preload('roles', (roleTable) => {
          roleTable.select('id', 'name')
        })
        .filter(inputs)
      return response.ok(usersWithoutPagination)
    }

    try {
      const users = await User.query()
        .preload('addresses')
        .preload('roles', (roleTable) => {
          roleTable.select('id', 'name')
        })
        .filter(inputs)
        .paginate(page || 1, itemsPerPage || 2)

      return response.ok(users)
    } catch (error) {
      return response.badRequest({
        message: 'Error in listing users',
        originalErrorMessage: error.message,
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const userBody = request.only(['name', 'cpf', 'email', 'password', 'profilePicUrl'])
    const addressBody = request.only([
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    const urlProfilePic = request.file('profilePicUrl')

    try {
      let url: string
      url = await sendImgToS3AWS(urlProfilePic, { name: userBody.name, cpf: userBody.cpf })
    } catch (error) {
      return response.badRequest({
        message: 'Error in upload image in S3 AWS Storage!',
        originalError: error.message,
      })
    }

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

    try {
      await sendMail(user, 'email/welcome')
    } catch (error) {
      ;(await trx).rollback()
      return response.badRequest({
        message: 'Error in send email welcome',
        originalError: error.message,
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

    try {
      const userFound = await User.query()
        .where('secure_id', id)
        .preload('addresses')
        .preload('roles')
      return response.ok(userFound)
    } catch (error) {
      return response.notFound({ message: `User not found.`, originalErrorMessage: error.message })
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const userSecureId = params.id
    const userBody = request.only(['name', 'cpf', 'email', 'password', 'profilePicUrl'])
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

    const urlProfilePic = request.file('profilePicUrl')

    let user = new User()
    const trx = Database.transaction()

    try {
      user = await User.findByOrFail('secure_id', userSecureId)

      let url: string
      try {
        url = await sendImgToS3AWS(urlProfilePic, { name: user.name, cpf: user.cpf })
      } catch (error) {
        return response.badRequest({
          message: 'Error in upload image in S3 AWS Storage!',
          originalError: error.message,
        })
      }

      userBody.profilePicUrl = url

      user.useTransaction(await trx)
      await user.merge(userBody).save()
    } catch (error) {
      ;(await trx).rollback()
      return response.badRequest({
        message: 'Error in updating user',
        originalErrorMessage: error.message,
      })
    }

    if (addressBody.addressId) {
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
    const { id } = params

    try {
      await User.query().where('secure_id', id).delete()
      return response.ok({ message: `User deleted succesfully!` })
    } catch (error) {
      return response.notFound({ message: `User not found.`, originalErrorMessage: error.message })
    }
  }

  public async AccessAllow({ response, request }: HttpContextContract) {
    await request.validate(AccessAllowValidator)

    const { user_id, roles } = request.all()

    try {
      const userAllow = await User.findByOrFail('id', user_id)

      let roleIds: number[] = []
      await Promise.all(
        roles.map(async (roleName) => {
          const hasRole = await Role.findBy('name', roleName)
          if (hasRole) roleIds.push(hasRole.id)
        })
      )

      await userAllow.related('roles').sync(roleIds)
    } catch (error) {
      return response.badRequest({ message: 'Error in access allow', originalError: error.message })
    }

    try {
      return User.query().where('id', user_id).preload('roles').preload('addresses').firstOrFail()
    } catch (error) {
      return response.badRequest({
        message: 'Error in find user',
        originalError: error.message,
      })
    }
  }
}
