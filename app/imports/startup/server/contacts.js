/**
 * Created by reedvilanueva on 10/16/16.
 */

import { Contacts } from '../../api/contacts/contacts.js';
import { _ } from 'meteor/underscore';

/**
 * A list of Stuff to pre-fill the Collection.
 * @type {*[]}
 */
const contactsSeeds = [
  {
    firstName: 'Reed', lastName: 'Villanueva',
    address: 'Kaneohe, HI',
    phone: '808-239-9390', email: 'reedv@hawaii.edu',
  },
  {
    firstName: 'Henri', lastName: 'Casanova',
    address: '1680 East-West Rd., Honolulu, HI	',
    phone: '808-956-2649	', email: 'henric@hawaii.edu',
  },
  {
    firstName: 'Kim', lastName: 'Binsted',
    address: '1680 East-West Rd., Honolulu, HI	',
    phone: '808-956-6107	', email: 'binsted@hawaii.edu',
  },
];

/**
 * Initialize the Stuff collection if empty with seed data.
 */
if (Contacts.find().count() === 0) {
  _.each(contactsSeeds, function seedContacts(contact) {
    Contacts.insert(contact);
  });
}
