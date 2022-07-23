// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TestGroupsController {
  public async testGet() {
    return { message: `Test get is ok!` }
  }
}
