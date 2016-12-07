/**
 * Created by reedvilanueva on 11/30/16.
 */

import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

/* eslint-disable object-shorthand */

export const CategoriesDict = new Mongo.Collection('CategoriesDict');

/**
 * Create the schema
 */
export const CategoriesDictSchema = new SimpleSchema({
  category: {
    label: 'category',
    type: String,
    optional: false,
    max: 200,
  },
  related: {
    label: 'related',
    type: [String],
    optional: false,
    max: 200,
  }
});
CategoriesDict.attachSchema(CategoriesDictSchema);
