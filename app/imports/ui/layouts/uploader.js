 import { Meteor } from 'meteor/meteor';
 import { Template } from 'meteor/templating';
 import { Slingshot } from 'meteor/edgee:slingshot';

let temp;
const _getFileFromInput = (event) => event.target.files[0];

const _setPlaceholderText = (string = 'Click or Drag a File Here to Upload') => {
  temp.find('.alert span').innerText = string;
};

// TODO: Add URL to projects for display
// const _addUrlToDatabase = (url) => {
//   Meteor.call('storeUrlInDatabase', url, (error) => {
//     if (error) {
//       window.alert(`Error, could not store url. Code: ${error.message}`);
//       _setPlaceholderText();
//     } else {
//       window.alert('Image successfully uploaded');
//       _setPlaceholderText();
//     }
//   });
// };

const _uploadFileToAmazon = (file) => {
  const uploader = new Slingshot.Upload('uploadToAmazonS3');

  uploader.send(file, (error, url) => {
    if (error) {
      window.alert(error.message);
      _setPlaceholderText();
    } else {
      window.alert(`Image uploaded to ${url}`);
    }
  });
};

const upload = (options) => {
  temp = options.template;
  const file = _getFileFromInput(options.event);

  _setPlaceholderText(`Uploading ${file.name}...`);
  _uploadFileToAmazon(file);
};

Template.Uploader.events({
  'change input[type="file"]': (event, instance) => {
    upload({ event: event, template: instance });
  },
});