import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';

Slingshot.fileRestrictions('uploadToAmazonS3', {
  allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif'], // Sets allowed file formats
  maxSize: 5 * 1024 * 1024, // Sets max image size to 5 mb
});
