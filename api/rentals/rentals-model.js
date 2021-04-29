const db = require('../data/db-config');

const findAll = () => {

}

const findBy = async filter => { //eslint-disable-line
  
}

function formatRentals(data){
  const uniqueRentals = data.map((item, index, array) => {
    if(array[index+1] && item.rental_id === array[index+1].rental_id){
      return {
        tech_item_id: item.tech_item_id,
        tech_item_title:  item.tech_item_title,
        tech_item_description:  item.tech_item_description,
        tech_item_price: item.tech_item_price,
        min_rental_period: item.min_rental_period,
        max_rental_period: item.max_rental_period,
        category_id: item.category_id,
        owner_id: item.owner_id,
        rental_id: item.rental_id,
        rental_period: item.rental_period,
        created_at: item.created_at,
        renter_id: item.renter_id,
        renter_name: array[index+1].username,
        owner_name: item.username,
        category_name: item.category_name
      };
    }
  });
  const formatted = uniqueRentals.filter(item => item !== undefined);
  return formatted;
}

const findById = async rental_id => { //eslint-disable-line
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