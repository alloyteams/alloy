/**
 * Created by neilteves on 11/09/16.
 */

import {Projects} from './projects.js';
import {EasySearch} from 'meteor/easy:search';

export const ProjectsIndex = new EasySearch.Index({
  engine: new EasySearch.MongoDB(),
  collection: Projects,
  fields: ['skills'],
  defaultSearchOptions: {
    limit: 8,
  },
});
