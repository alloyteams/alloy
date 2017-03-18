import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';
// import { Users, UsersSchema } from '../../api/users/users.js';

Slingshot.fileRestrictions('uploadToAmazonS3', {
  allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif'], // Sets allowed file formats
  maxSize: 5 * 1024 * 1024, // Sets max image size to 5 mb
});

Slingshot.createDirective('uploadToAmazonS3', Slingshot.S3Storage, {
  bucket: 'alloy-images',
  region: 'us-west-1',
  acl: 'public-read',
  authorize: () => {
    console.log(Meteor.settings.AWSAccessKeyId);
    console.log(Meteor.settings.AWSSecretAccessKey);
    // Deny uploads if user is not logged in.
    // if (!Meteor.user().profile._id) {
    //   const message = 'Please login before uploading files';
    //   throw new Meteor.Error('Login Required', message);
    // }

    return true;
  },
  key: (file) => {
    const user = Meteor.user().profile._id;
    return Meteor.user().profile._id + '/' + file.name;
  },
});
