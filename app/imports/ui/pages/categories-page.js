/**
 * Created by reedvilanueva on 10/19/16.
 */
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Contacts, ContactsSchema } from '../../api/contacts/contacts.js';

Template.Categories_Page.onRendered(function enableSemantic() {
  const instance = this;
  // instance.$('select.ui.dropdown').dropdown();
  // instance.$('.ui.selection.dropdown').dropdown();
  // instance.$('select.dropdown').dropdown();
  // instance.$('.ui.checkbox').checkbox();
  // instance.$('.ui.radio.checkbox').checkbox();

  // attaches sidebar to pusher element (profiles cards view), rather than body
  instance.$('.ui.sidebar')
      .sidebar({
        context: $('.pusher')  // alts: .pusher OR .pusher .ui.container
      })
});