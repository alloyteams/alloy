import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';

Slingshot.fileRestrictions('uploadToAmazonS3', {
  allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif'], // Sets allowed file formats
  maxSize: 5 * 1024 * 1024, // Sets max image size to 5 mb
});

Slingshot.createDirective('uploadToAmazonS3', Slingshot.S3Storage, {
  bucket: 'alloy-images',
  acl: 'public-read',
  authorize: () => {
    // Deny uploads if user is not logged in.
    if (!this.userId) {
      const message = 'Please login before posting files';
      throw new Meteor.Error('Login Required', message);
    }
  },
  key: (file) => {
    const user = Meteor.users.findOne(this.userId);
    return user.username + '/' + file.name;
  },
});
