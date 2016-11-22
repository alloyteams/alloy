/**
 * Created by reedvilanueva on 11/3/16.
 */
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
import PriorityQueue from 'js-priority-queue';
import {Meteor} from 'meteor/meteor';

// to import normal js libraries, see https://guide.meteor.com/structure.html#importing-from-packages

/** @module SkillGraph */

/**
 * @extends BaseCollection
 */

/**
 *
 * @param {string} str
 * @return {string} string intended to be equal to other strings with same
 * sequence of characters, regaudless of whitespace and capitalization.
 * @private
 */
function _makeUniform(str) {
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
}

/**
 * edge object for skillgraph, where each vertex is a lowercase, whitespace-removed string
 */
class Edge {

  /**
   * @param {String} v
   * @param {String} w
   * @param {Number} weight
   * Creates edge object with the given params.
   * Vertices as set as lowercase, whitespace-removed strings.
   */
  constructor(v, w, weight) {
    check(v, String);
    check(w, String);
    check(weight, Number);
    this._v = _makeUniform(v);
    this._w = _makeUniform(w);
    this._baseWeight = 0;
    this._weight = weight + this._baseWeight;
  }

  /**
   * @param obj
   * @returns {Edge}
   * Takes an object with all, and only, the expected fields of an Edge object
   * and return an Edge object based on the given obj's field values. Else,
   * returns undefined.
   */
  static objToEdge(obj) {
    // console.log("In objToEdge")
    // console.log(obj)
    if (obj.hasOwnProperty("_v") && obj.hasOwnProperty("_w") &&
        obj.hasOwnProperty("_baseWeight") && obj.hasOwnProperty("_weight")) {
      check(obj._v, String);
      check(obj._w, String);
      check(obj._weight, Number);
      // console.log("In objToEdge: returning new Edge")
      return new Edge(obj._v, obj._w, obj._weight);
    } else return undefined;
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
   * @param {string} v
   * @param {string} w
   * @returns {boolean} true when this edge connects vertices v and w, else false
   */
  connects(v, w) {
    return (this.either() === v && this.other(v) === w)
        || (this.either() === w && this.other(w) === v);
  }

  /**
   *
   * @param thatEdge
   * @returns {number} -1 if 'that' dominates this edge, +1 if this edge dominates 'that', else 0
   */
  compareTo(thatEdge) {
    if (this.getWeight() < thatEdge.getWeight())   return -1;
    else
      if (this.getWeight() > thatEdge.getWeight()) return +1;
      else                                         return 0;
  }

  // For debugging. Will depend on what is stored as _v and _w (would need to be printable things)
  toString() {
    return `(${this._v})--(${this._w}): ${this._weight}`;
  }

}
export {Edge};  // needed so we can create Edge instances in other files

/**
 * A bidirectional, weighted graph where vertices are lowercase,
 * whitespace-removed strings denoting skills.
 */
class SkillGraph extends BaseCollection {

  /**
   * Creates the Semester collection.
   */
  constructor() {
    // set the parent _collection field to be used as an adjacency list for skill nodes
    super(
        'SkillGraph',
        new SimpleSchema({
          skill: { label: 'skill', optional: false, type: String },
          adj: { label: 'adj', optional: false, type: [Edge] },
        }),
        function transform(doc) {
          // for transforming objs in adj lists back to edges
          const adj = _.map(doc.adj, (obj) => {
            return Edge.objToEdge(obj);
          });
          doc.adj = adj;
          return doc;
        }
    );

    this._edgeCount = 0;
    this._vertexCount = 0;
  }

  edgeCount() {
    return this._edgeCount;
  }

  vertexCount() {
    return this._vertexCount;
  }

  /**
   *
   * @param skill
   * adds the given lowercase, whitespace-removed skill to the graph if none with that label currently exists
   */
  addVertex(skill) {
    check(skill, String);
    skill = _makeUniform(skill);
    const exists = this._collection.findOne({ skill: skill });
    if (!exists) {
      const newSkill = {
        skill: skill,
        adj: [],
      };
      this._collection.insert(newSkill);

      this._vertexCount++;
    } else console.log(`SkillGraphCollection: addVertex(): ${skill}: already in graph\n`);
  }

  /**
   *
   * @param {[String]} skills
   * Adds all skills to the graph, connects all listed skills to each other each with a single edge.
   * All skills added as lowercase, whitespace-removed strings.
   */
  addVertexList(skills) {
    // add all vertices in skills to graph
    _.each(skills, (skill) => {
      this.addVertex(skill);
    });

    // add edges to graph
    // all the skills get ONE undirected edge to the other skills mentioned in the skills array
    // (excluding themselves and avoid double-counting)
    for (let i = 0; i < skills.length - 1; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        let edge = new Edge(skills[i], skills[j], 0);
        // TODO: these edges are objects, which get passed by reference. Will there be a problem with these edge instances being destroyed and thus the collection doc. holding the references to them will no longer have that data?
        this.addEdge(edge);
      }
    }
  }

  /**
   * @param edge
   * Add an edge to the graph
   * WARNING:
   * Assumes that the vertices of the inserting edge are already in the graph w/ addVertex(skill).
   * Assumes that the edge being added was constructed using the default Edge constructor
   */
  addEdge(edge) {
    check(edge, Edge);
    // console.log(`edge is instanceOf Edge: ${(edge instanceof Edge)}`);
    console.log(`addingEdge ${edge}`);
    let v = edge.either();
    let w = edge.other(v);
    const adjV = this.adjList(v);
    const adjW = this.adjList(w);

    // check that adj list of v does NOT ALREADY contain an edge to w
    // Meteor wont store the edge objects as Edge instances. see http://stackoverflow.com/a/32554410
    // So need special way to use Edge methods. see http://stackoverflow.com/a/8736980
    const existingEdge = _.find(adjV, (e) => {
          if (e) {
            return e.connects(v, w);
          }
        }
    );
    if (!existingEdge) {
      console.log(`edge ${v}--${w} NOT exists: inserting`);
      // if edge NOT already in adjLists of v and w, add it to BOTH those lists
      this._insertEdge(edge);
    } else {
      console.log(`edge ${v}--${w} ALREADY exists: updating`);
      // else edge v-w already in adj. of v AND w, update the weight on that edge for both vertices.
      // as long as we have been adding edges using addEdge(), there should be no case where v has an edge
      // v-w, but w does not.
      this._updateEdge(adjV, v, edge);
      this._updateEdge(adjW, w, edge);
    }
    console.log();
  }

  _insertEdge(edge) {
    // we don't _makeUniform() here b/c assume edges received have already been made uniform
    const v = edge.either();
    const w = edge.other(v);
    this._collection.update({ skill: v }, { $addToSet: { adj: edge } });
    this._collection.update({ skill: w }, { $addToSet: { adj: edge } });
    this._edgeCount++;
  }

  _updateEdge(adj, vertex, edge) {
    const v = edge.either();
    const w = edge.other(v);
    const incAmount = 10;
    this._collection.update({ skill: vertex }, {
      $set: {
        adj: _.map(adj, (e) => {
          if (e.connects(v, w)) {
            e.setWeight(e.getWeight() + incAmount);
            return e;
          } else return e;
        })
      }
    });
  }


  /**
   * @param {string} skill
   * @returns {[Edge]} the adjacency list associated with the given skill in the graph
   */
  adjList(skill) {
    //console.log(`In adjList(${skill})`);
    skill = _makeUniform(skill);
    const skillVertex = this._collection.findOne({ skill: skill });
    // console.log(skillVertex);
    // console.log();
    return skillVertex.adj;
  }

  /**
   *
   * @param {string} skill
   * @return {PriorityQueue} a 1-indexed priority queue of Edge objects by descending weights
   */
  adjMaxPQ(skill) {
    skill = _makeUniform(skill);
    const adjList = this.adjList(skill);

    // see https://github.com/adamhooper/js-priority-queue#options
    const edgeMaxCompare = function (e1, e2) {
      return e2.getWeight() - e1.getWeight();
    };
    const maxPQ = new PriorityQueue({
      comparator: edgeMaxCompare,
      initialValues: adjList,
      strategy: PriorityQueue.BinaryHeapStrategy
    });

    console.log(maxPQ)
    return maxPQ;
  }

  /**
   * @param {string} skill-vertex
   * @returns {string} string includes both vertices of edges and associated weight
   */
  adjListToString(skill) {
    let str = `skill: ${skill}\n`;
    skill = _makeUniform(skill);
    for (let edge of this.adjList(skill)) {
      str += `${edge.toString()}\n`;
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
