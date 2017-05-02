import { Meteor } from 'meteor/meteor';
import { Images } from '../../api/images/images.js';

const fileExistsInDatabase = (url) => Images.findOne({
  url: url,
  userId: Meteor.userId() },
    { fields: { '_id': 1 } });

const isNotAmazonUrl = (url) => url.indexOf('.amazonaws.com') < 0;

const validateUrl = (url) => {
  if (fileExistsInDatabase(url)) {
    return { valid: false, error: 'Sorry, this file already exists!' };
  }

  if (isNotAmazonUrl(url)) {
    return { valid: false, error: "Sorry, this isn't a valid URL!" };
  }

  return { valid: true };
};

const validate = (url) => {
  const test = validateUrl(url);

  if (!test.valid) {
    throw new Meteor.Error('file-error', test.error);
  }
};

Meteor.methods({
  storeUrlInDatabase: (url) => {
    validate(url);

    try {
      Images.insert({
        url: url,
        userId: Meteor.userId(),
        added: new Date(),
      });
    } catch (exception) {
      return exception;
    }
  },
});
