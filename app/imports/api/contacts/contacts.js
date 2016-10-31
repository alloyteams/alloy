/**
 * Created by reedvilanueva on 10/16/16.
 */

import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/* eslint-disable object-shorthand */

export const Contacts = new Mongo.Collection('Contacts');

/**
 * Create the schema for Stuff
 */
export const ContactsSchema = new SimpleSchema({
  firstName: {
    label: 'firstName',
    type: String,
    optional: false,
    max: 200,
  },
  lastName: {
    label: 'lastName',
    type: String,
    optional: false,
    max: 200,
  },
  address: {
    label: 'address',
    type: String,
    optional: false,
    max: 200,
  },
  phone: {
    label: 'phone',
    type: String,
    optional: false,
    max: 200,
  },
  email: {
    label: 'email',
    type: String,
    optional: false,
    max: 200,
  },


});

Contacts.attachSchema(ContactsSchema);
