import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    // ADMIN USER
    const adminSearchKey = { email: 'admin@email.com' }
    const adminUser = await User.updateOrCreate(adminSearchKey, {
      name: 'Admin',
      cpf: '000.000.000-01',
      email: 'admin@email.com',
      password: 'secret',
    })
    const adminRole = await Role.findBy('name', 'admin')
    if (adminRole) {
      await adminUser.related('roles').attach([adminRole.id])
    }

    // CLIENT USER
    const clientSearchKey = { email: 'client@email.com' }
    const clientUser = await User.updateOrCreate(clientSearchKey, {
      name: 'Client',
      cpf: '000.000.000-02',
      email: 'client@email.com',
      password: 'secret',
    })
    const clientRole = await Role.findBy('name', 'client')
    if (clientRole) await clientUser.related('roles').attach([clientRole.id])

    // EMPLOYEE USER
    const employeeSearchKey = { email: 'employee@email.com' }
    const employeeUser = await User.updateOrCreate(employeeSearchKey, {
      name: 'Employee',
      cpf: '000.000.000-03',
      email: 'employee@email.com',
      password: 'secret',
    })
    const employeeRole = await Role.findBy('name', 'employee')
    if (employeeRole) await employeeUser.related('roles').attach([employeeRole.id])
  }
}
