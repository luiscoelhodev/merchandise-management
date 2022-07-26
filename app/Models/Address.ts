import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Address extends BaseModel {
  public static table = 'addresses'
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public zipCode?: string

  @column()
  public state: string

  @column()
  public city: string

  @column()
  public street: string

  @column()
  public district?: string

  @column()
  public number?: number

  @column()
  public complement?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
