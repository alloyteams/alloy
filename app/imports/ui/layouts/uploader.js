import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Slingshot } from 'meteor/edgee:slingshot';

let temp;
let fURL;
const getFileFromInput = event => event.target.files[0];

const setPlaceholderText = (string = 'Click or Drag a File Here to Upload') => {
  temp.find('.alert span').innerText = string;
};

// TODO: Add URL to projects for display
// const addUrlToDatabase = (url) => {
//   Meteor.call('storeUrlInDatabase', url, (error) => {
//     if (error) {
//       window.alert(`Error, could not store url. Code: ${error.message}`);
//       setPlaceholderText();
//     } else {
//       window.alert('Image successfully uploaded');
//       setPlaceholderText();
//     }
//   });
// };

const uploadFileToAmazon = (file) => {
  const uploader = new Slingshot.Upload('uploadToAmazonS3');

  uploader.send(file, (error, url) => {
    if (error) {
      window.alert(error.message);
      setPlaceholderText();
    } else {
      // addUrlToDatabase(url);
      setPlaceholderText(url);
    }
  });
};

const upload = (options) => {
  temp = options.template;
  const file = getFileFromInput(options.event);

  setPlaceholderText(`Uploading ${file.name}...`);
  uploadFileToAmazon(file);
};

Template.Uploader.events({
  'change input[type="file"]': (event, instance) => {
    upload({ event, template: instance });
  },
});

Template.Uploader.helpers({
  getURL: () => `${fURL}`,
});