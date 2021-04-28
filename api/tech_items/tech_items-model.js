const db = require('../data/db-config');

const findAll = () => {
  return db('tech_items as ti')
    .leftJoin('categories as cat', 'ti.category_id', 'cat.category_id')
    .leftJoin('users as u', 'u.user_id', 'ti.owner_id')
    .select('ti.*', 'u.username', 'cat.category_name');
}

const findBy = filter => {
  
}

const findById = tech_item_id => {
  return db('tech_items as ti')
  .leftJoin('categories as cat', 'ti.category_id', 'cat.category_id')
  .leftJoin('users as u', 'u.user_id', 'ti.owner_id')
  .select('ti.*', 'u.username', 'cat.category_name')
  .where({ tech_item_id })
  .first();
}

const create = async tech_item => {
  const { 
    tech_item_title,
    tech_item_description,
    tech_item_price,
    min_rental_period,
    max_rental_period,
    category_name,
    owner_id
  } = tech_item;
  let created_tech_item_id;
  await db.transaction(async trx => {
    let category_id_to_use;
    const [ category ] = await trx('categories').where({ category_name });
    if(category){
      category_id_to_use = category.category_id;
    } else {
      const [ category ] = await trx('categories as cat').insert({ category_name }, ['cat.category_id']);
      category_id_to_use = category.category_id;
    }
    const [ tech_item ] = await trx('tech_items as ti').insert({
      tech_item_title,
      tech_item_description,
      tech_item_price,
      min_rental_period,
      max_rental_period,
      owner_id,
      category_id: category_id_to_use
    }, ['ti.tech_item_id']);
    created_tech_item_id = tech_item.tech_item_id;
  });
  return findById(created_tech_item_id);
}

const update = async (tech_item_id, changes) => {
  const { 
    tech_item_title,
    tech_item_description,
    tech_item_price,
    min_rental_period,
    max_rental_period,
    category_name,
    owner_id
  } = changes;
  await db.transaction(async trx => {
    let category_id_to_use;
    
    const [ category ] = await trx('categories').where({ category_name });
    
    if(category){
      category_id_to_use = category.category_id;
    } else {
      const [ category ] = await trx('categories as cat').insert({ category_name }, ['cat.category_id']);
      category_id_to_use = category.category_id;
    }
    
    await trx('tech_items as ti')
      .where({ tech_item_id })
      .update({
        tech_item_title,
        tech_item_description,
        tech_item_price,
        min_rental_period,
        max_rental_period,
        owner_id,
        category_id: category_id_to_use 
      });
    });
  return findById(tech_item_id);
}

const deleteById = async tech_item_id => {
  await db.transaction(async trx => {
    const [ category ] = await trx('tech_items as ti')
      .join('categories as cat', 'ti.category_id', 'cat.category_id')
      .select('cat.category_name')
      .where({ tech_item_id });
    
    await trx('rentals as r')
      .where({ tech_item_id })
      .delete();

    const techItemsByCategory = await trx('categories as cat')
      .join('tech_items as ti', 'cat.category_id', 'ti.category_id')
      .select('ti.*', 'cat.category_name')
      .where({ category_name: category.category_name });
    
    if(techItemsByCategory.length === 0){
      await trx('categories as cat')
        .where({ category_name: category.category_name })
        .delete();
    }

    await trx('tech_items as ti')
      .where({ tech_item_id })
      .delete();
  });
  return tech_item_id;
}

module.exports = {
  findAll,
  findBy,
  findById,
  create,
  update,
  deleteById
}