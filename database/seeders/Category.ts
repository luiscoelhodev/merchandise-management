import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Category from 'App/Models/Category'

export default class CategorySeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const uniqueKey = 'name'

    await Category.updateOrCreateMany(uniqueKey, [
      {
        name: 'Açougue',
        observation: 'Carnes em geral',
      },
      {
        name: 'Limpeza',
        observation: 'Produtos para limpeza em geral',
      },
      {
        name: 'Higiene',
        observation: 'Produtos para higiene em geral',
      },
      {
        name: 'Hortifrutti',
        observation: 'Frutas e legumes em geral',
      },
    ])
  }
}
