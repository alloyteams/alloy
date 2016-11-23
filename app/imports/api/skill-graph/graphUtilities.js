/**
 * Created by reedvilanueva on 11/22/16.
 */

module.exports = {
  /**
   *
   * @param {string} str
   * @return {string} string intended to be equal to other strings with same
   * sequence of characters, regaudless of whitespace and capitalization.
   */
  makeUniform: function (str) {
    // TODO: I made this so users can enter, eg. 'javascript' and 'Java Script' and get same results, can improve?
    // FIXME: will this affect how Edges interact? I think so, go thru and check.
    // suggestion:
    //  Graph stores skills as lowercase-spaceremoved strings.
    //  When returning project(s) based on skill graph edges,
    //    convert the given search term/skill to lowercase-spaceremoved as well
    //    (to get list of adj skills), then determine which projects have matching
    //    skills by comparing THEIR lowercase-spaceremoved skills to these adj skills,
    //    we then return those matching projects.

    // converts to lowercase and removes all whitespaces. see http://stackoverflow.com/a/6623263
    return str.toLowerCase().replace(/\s/g, '');
  },

  /**
   *
   * @param str
   * @return {string}
   * returns version of str w/ all letters lowercase, except for the first
   * letter of each (whitespace separated) word
   */
  makeReadable: function (str) {
    // split string into array of words
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      // Assign it back to the array w/ each leading letter capitalized
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
  }
};