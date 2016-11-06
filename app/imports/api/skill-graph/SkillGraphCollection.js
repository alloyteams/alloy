/**
 * Created by reedvilanueva on 11/3/16.
 */
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
import {Meteor} from 'meteor/meteor';

// I think can also import normal js libraries. see https://guide.meteor.com/structure.html#importing-from-packages

/** @module SkillGraph */

/**
 * @extends BaseCollection
 */
class Edge {

  /**
   * @param {String} v
   * @param {String} w
   * @param {Number} weight
   * Creates edge object
   */
  constructor(v, w, weight) {
    check(v, String);
    check(w, String);
    check(weight, Number);
    this._v = v;
    this._w = w;
    this._baseWeight = 10;
    this._weight = weight + this._baseWeight;
  }

  /**
   *
   * @returns {Number} the weight of this edge
   */
  getWeight() {
    return this._weight;
  }

  setWeight(weight) {
    this._weight = weight;
  }

  /**
   *
   * @returns {String} either of the vertices of this edge
   */
  either() {
    return this._v;
  }

  /**
   *
   * @param vertex
   * @returns {String} the vertex opposite to the one provided on this edge
   */
  other(vertex) {
    return (vertex === this._v)
        ? this._w
        : this._v;
  }

  /**
   *
   * @param v
   * @param w
   * @returns {boolean} true when this edge connects vertices v and w, else false
   */
  connects(v, w) {
    return (this.either()===v && this.other(v)===w)
        || (this.either()===w && this.other(w)===v);
  }

  /**
   *
   * @param thatEdge
   * @returns {number} -1 if 'that' dominates this edge, +1 if this edge dominates 'that', else 0
   */
  compareTo(thatEdge) {
    if (this.getWeight() < thatEdge.getWeight())      return -1;
    else if (this.getWeight() > thatEdge.getWeight()) return +1;
    else                                              return 0;
  }

  // For debugging. Will depend on what is stored as _v and _w (would need to be printable things)
  toString() {
    return `(${this._v})--(${this._w}): ${this._weight}`;
  }

}
export { Edge };  // needed so we can create Edge instances in other files



class SkillGraph extends BaseCollection {

  /**
   * Creates the Semester collection.
   */
  constructor() {
    // set the parent _collection field to be used as an adjacency list for skill nodes
    super('SkillGraph', new SimpleSchema({
      skill: { label: 'skill', optional: false, type: String },
      adj: { label: 'adj', optional: false, type: [Edge] },
    }));

    this._edgeCount = 0;
    this._vertexCount = 0;
  }

  edgeCount() { return this._edgeCount; }
  vertexCount() { return this._vertexCount; }

  /**
   *
   * @param skill
   * adds the given skill to the graph if none with that label currently exists
   */
  addVertex(skill) {
    check(skill, String);
    const exists = this._collection.findOne({skill: skill});
    if (!exists) {
      const newSkill = {
        skill: skill,
        adj: [],
      };
      this._collection.insert(newSkill);

      this._vertexCount++;
    }
  }

  /**
   * @param edge
   * Add an edge to the graph
   * FIXME: WARNING: assumes that the vertices of the inserting edge are already in the graph
   */
  addEdge(edge) {
    check(edge, Edge);
    console.log(`edge is instanceOf Edge: ${(edge instanceof Edge)}`);
    console.log(`addingEdge ${edge}`);
    const v = edge.either();
    const w = edge.other(v);
    const adjV = this.adjList(v);
    const adjW = this.adjList(w);

    // check that adj list of v does NOT ALREADY contain an edge to w
    // FIXME: this check only tells whether edge exists in v's adjList, NOT w's
    const existingEdge = _.find(adjV, (edge) => {
      return (edge._v===v && edge._w===w) || (edge._v===w && edge._w===v) });  // TODO: use edge.connects(v, w)
    // FIXME: for some reason, won't let me use Edge methods, instead makes me refer to the underlying fields (may have something to do with underscore, like it does not acknowledge the associated class)
    // This may be a meteor problem, try type casting. see http://stackoverflow.com/a/32554410
    if ( !existingEdge ) {
      console.log(`edge ${v}--${w} NOT exists`);
      // if edge not already in adjLists of v and w, add it to both those lists
      this._collection.update({ skill: v }, { $addToSet: { adj: edge } });
      this._collection.update({ skill: w }, { $addToSet: { adj: edge } });
      this._edgeCount++;
    } else {
        console.log(`edge ${v}--${w} ALREADY exists`);
        // else edge v-w already in adj. of v and w, update the weight on that edge for each vertex
        for (let i=0; i < adjV.length; i++) {
          // Meteor wont store the edge objects as Edge instances. So need special way to use Edge methods
          // see http://stackoverflow.com/a/8736980
          if ( Edge.prototype.connects(v, w).call(adjV[i]) ) {
            // update the adjList of v and use to replace the old one
            // see http://stackoverflow.com/a/38864747
            let incAmount = 10;
            Edge.prototype.setWeight(
                Edge.prototype.getWeight().call(adjV[i]) + incAmount)
                .call(adjV[i]);
            this._collection.update({skill: v}, { $set: {adj: adjV} });
            break;
          }
        }
        for (let i=0; i < adjW.length; i++) {
          if ( Edge.prototype.connects(v, w).call(adjW[i]) ) {
            // update the adjList of w and use to replace the old one
            let incAmount = 10;
            Edge.prototype.setWeight(
                Edge.prototype.getWeight().call(adjW[i]) + incAmount)
                .call(adjW[i]);
            this._collection.update({skill: w}, { $set: {adj: adjW} });
            break;
          }
      }
    }
    console.log();
  }

  /**
   * @param skill
   * @returns {[Edge]} the adjacency list associated with the given skill in the graph
   */
  adjList(skill) {
    console.log(`In adjList(${skill})`);
    const skillVertex = this._collection.findOne({skill: skill});
    console.log(skillVertex);
    console.log(`skillVertex.adj[0] is instanceOf Edge: ${(skillVertex.adj[0] instanceof Edge)}`);
    console.log(skillVertex.adj[0]);
    console.log();
    return skillVertex.adj;
  }


  adjListToString(skill) {
    let str = `skill: ${skill}\n`;
    for (let edge of this.adjList(skill)) {
      console.log(edge);
      // Meteor wont store the edge objects as Edge instances. see http://stackoverflow.com/a/8736980
      str += `${Edge.prototype.toString.call(edge)}\n`;  // call arg sets context (eg. defines what 'this' refers to)
    }
    return str;
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
// WARNING: the exported const can't have same name as 'type' param. given to constructor
// (causes 'duplicate declaration' error)
export const SkillGraphCollection = new SkillGraph();
