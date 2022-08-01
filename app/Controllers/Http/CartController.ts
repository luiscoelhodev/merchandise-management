import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'
import StoreValidator from 'App/Validators/Cart/StoreValidator'
import UpdateValidator from 'App/Validators/Cart/UpdateValidator'

export default class CartController {
  public async index({ auth, response }: HttpContextContract) {
    const authUser = auth.user?.id

    let cartInfo = {
      itemsQuantity: 0,
      totalPrice: 0,
    }

    if (authUser) {
      try {
        const itemsCart = await Cart.query()
          .where('user_id', authUser)
          .preload('user', (queryUser) => {
            queryUser.select('id', 'name', 'email')
          })
          .preload('product', (queryProduct) => {
            queryProduct.select('id', 'name', 'code', 'price')
          })

        itemsCart.forEach(({ quantity, product }, index) => {
          cartInfo.totalPrice = product.price * quantity + cartInfo.totalPrice
          cartInfo.itemsQuantity = index + 1
        })

        return response.ok({
          cartInfo,
          itemsCart,
        })
      } catch (error) {
        return response.notFound({ message: 'Cart items not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be logged in!' })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    await request.validate(StoreValidator)

    let cartBody = request.only(['user_id', 'product_id', 'quantity'])
    cartBody.user_id = auth.user?.id

    const isProductAlreadyInCart = await Cart.query()
      .where('user_id', cartBody.user_id)
      .andWhere('product_id', cartBody.product_id)
      .first()

    if (isProductAlreadyInCart) {
      return response.badRequest({ message: 'This product is already in your cart.' })
    }

    try {
      const cart = await Cart.create(cartBody)
      return response.ok(cart)
    } catch (error) {
      return response.badRequest({
        message: 'Error in registering item in cart',
        originalErrorMessage: error.message,
      })
    }
  }

  public async show({ response, auth, params }: HttpContextContract) {
    const authUser = auth.user?.id
    const productId = params.id
    if (authUser) {
      try {
        const cartItems = await Cart.query()
          .where('user_id', authUser)
          .andWhere('product_id', productId)
          .preload('user', (queryUser) => {
            queryUser.select('id', 'name', 'email')
          })
          .preload('product', (queryProduct) => {
            queryProduct.select('id', 'name', 'code', 'price')
          })
          .firstOrFail()

        return response.ok({
          totalItemPrice: (cartItems.quantity * cartItems.product.price).toFixed(2),
          cartItems,
        })
      } catch (error) {
        return response.notFound({
          message: 'Cart item not found',
          originalErrorMessage: error.message,
        })
      }
    } else {
      return response.unauthorized({ message: 'You need to be logged in!' })
    }
  }

  public async update({ request, auth, params, response }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const authUser = auth.user?.id
    const productId = params.id
    const { addOneItem, removeOneItem, setItemQuantity } = request.all()

    if (authUser) {
      try {
        const itemCart = await Cart.query()
          .where('user_id', authUser)
          .andWhere('product_id', productId)
          .firstOrFail()

        if (addOneItem) {
          itemCart.quantity = itemCart.quantity + 1
        } else if (removeOneItem) {
          itemCart.quantity = itemCart.quantity - 1
        } else if (setItemQuantity) {
          itemCart.quantity = setItemQuantity
        }

        await itemCart.save()

        return response.ok(itemCart)
      } catch (error) {
        return response.notFound({ message: 'Cart item not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be logged in!' })
    }
  }

  public async destroy({ response, auth, params }: HttpContextContract) {
    const authUser = auth.user?.id
    const productId = params.id

    if (authUser) {
      try {
        const itemCart = await Cart.query()
          .where('user_id', authUser)
          .andWhere('product_id', productId)
          .firstOrFail()

        await itemCart.delete()

        return response.ok({
          message: 'Item removed successfully',
        })
      } catch (error) {
        return response.notFound({ message: 'Cart item not found', originalError: error.message })
      }
    } else {
      return response.unauthorized({ message: 'You need to be logged in!' })
    }
  }
}
