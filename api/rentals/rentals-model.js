const db = require('../data/db-config');
const { formatRentals } = require('../utils/formatRentals');

const findAll = () => {

}

const findBy = async filter => { //eslint-disable-line
  
}



const findById = async rental_id => {
  const row = await db('rentals as r')
    .join('users as u', function(){
      this
        .on('r.renter_id', '=', 'u.user_id')
    })
    .join('tech_items as ti', 'ti.tech_item_id', 'r.tech_item_id')
    .join('categories as cat', 'cat.category_id', 'ti.category_id')
    .select('ti.*', 'r.*', 'u.username as renter_name', 'cat.category_name')
    .where({ rental_id })
    .first();
  if(row){
    const { owner_name } = await db('users as u')
      .where({ user_id: row.owner_id })
      .select('u.username as owner_name')
      .first();
    return {
      ...row,
      owner_name
    };
  } else {
    return row;
  }
}

const findByRenterId = async renter_id => {
  const rows = await db('rentals as r')
    .join('users as u', function(){
      this
        .on('r.renter_id', '=', 'u.user_id')
        .orOn('r.owner_id', '=', 'u.user_id');
    })
    .join('tech_items as ti', 'ti.tech_item_id', 'r.tech_item_id')
    .join('categories as cat', 'cat.category_id', 'ti.category_id')
    .select('ti.*', 'r.*', 'u.username', 'cat.category_name')
    .where({ renter_id })
    .orderBy('r.rental_id');
  return formatRentals(rows);
}

const create = tech_item => { //eslint-disable-line

}

const update = (rental_id, changes) => { //eslint-disable-line

}

const deleteById = rental_id => { //eslint-disable-line

}

module.exports = {
  findAll,
  findBy,
  findById,
  findByRenterId,
  create,
  update,
  deleteById
}