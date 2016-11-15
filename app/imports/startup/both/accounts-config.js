import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import {BaseCollection} from '../../api/base/BaseCollection.js'
import {
    SkillGraphCollection,
    Edge
} from '../../api/skill-graph/SkillGraphCollection.js';

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
  });
}

